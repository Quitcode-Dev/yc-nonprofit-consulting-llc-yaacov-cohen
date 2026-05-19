import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  assertRole,
  AuthorizationError,
} from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: moveId } = await context.params;

  // 1. Authenticate & authorise
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];

  try {
    const auth = await getAuthenticatedUser();
    user = auth.user;
    profile = auth.profile;
    assertRole(profile, ['solicitor', 'org_admin', 'super_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizationId = profile.organization_id;
  if (!organizationId) {
    return NextResponse.json(
      { error: 'No organization associated with this account' },
      { status: 400 }
    );
  }

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { completion_notes, follow_up } = body as {
    completion_notes?: string;
    follow_up?: {
      move_idea_id?: string;
      title?: string;
      due_date?: string;
    };
  };

  if (!completion_notes || typeof completion_notes !== 'string' || completion_notes.trim() === '') {
    return NextResponse.json({ error: 'completion_notes is required' }, { status: 422 });
  }

  const supabase = await createClient();

  // 3. Fetch the move and verify ownership / org
  const { data: move, error: fetchError } = await supabase
    .from('moves')
    .select('id, organization_id, solicitor_id, donor_id, status')
    .eq('id', moveId)
    .eq('organization_id', organizationId)
    .single();

  if (fetchError || !move) {
    return NextResponse.json({ error: 'Move not found' }, { status: 404 });
  }

  if (move.status === 'completed') {
    return NextResponse.json({ error: 'Move is already completed' }, { status: 409 });
  }

  if (profile.role === 'solicitor' && move.solicitor_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Validate follow-up payload if provided
  let followUpDueDate: Date | null = null;
  if (follow_up) {
    if (!follow_up.title || typeof follow_up.title !== 'string' || follow_up.title.trim() === '') {
      return NextResponse.json({ error: 'follow_up.title is required' }, { status: 422 });
    }
    if (!follow_up.due_date || typeof follow_up.due_date !== 'string') {
      return NextResponse.json({ error: 'follow_up.due_date is required' }, { status: 422 });
    }
    followUpDueDate = new Date(follow_up.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(followUpDueDate.getTime()) || followUpDueDate < today) {
      return NextResponse.json(
        { error: 'follow_up.due_date must be today or a future date' },
        { status: 422 }
      );
    }
  }

  // 5. Mark move as completed (follow_up_move_id updated after follow-up insert)
  const { data: completedMove, error: updateError } = await supabase
    .from('moves')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_notes: completion_notes.trim(),
    })
    .eq('id', moveId)
    .select()
    .single();

  if (updateError || !completedMove) {
    console.error('Error completing move:', updateError);
    return NextResponse.json({ error: 'Failed to complete move' }, { status: 500 });
  }

  // 6. Optionally create follow-up move
  let followUpMove = null;
  if (follow_up && follow_up.title && follow_up.due_date) {
    const { data: newMove, error: followUpError } = await supabase
      .from('moves')
      .insert({
        organization_id: organizationId,
        donor_id: move.donor_id,
        solicitor_id: move.solicitor_id,
        move_idea_id: follow_up.move_idea_id || null,
        due_date: follow_up.due_date,
        title: follow_up.title.trim(),
        status: 'pending',
        completion_notes: null,
        completed_at: null,
        parent_move_id: moveId,
        follow_up_move_id: null,
      })
      .select()
      .single();

    if (followUpError || !newMove) {
      console.error('Error creating follow-up move:', followUpError);
      // Completed move is already saved; return partial success with warning
      return NextResponse.json(
        { move: completedMove, warning: 'Move completed but follow-up could not be created' },
        { status: 207 }
      );
    }

    followUpMove = newMove;

    // Link follow_up_move_id on the completed move
    await supabase
      .from('moves')
      .update({ follow_up_move_id: newMove.id })
      .eq('id', moveId);
  }

  return NextResponse.json({ move: completedMove, follow_up_move: followUpMove }, { status: 200 });
}
