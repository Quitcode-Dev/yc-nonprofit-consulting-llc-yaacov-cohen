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

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
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
      name?: string;
      title?: string;
      due_date?: string;
    };
  };

  const notesTrimmed = typeof completion_notes === 'string' ? completion_notes.trim() : '';

  const supabase = await createClient();

  const { data: move, error: fetchError } = await supabase
    .from('moves')
    .select('id, organization_id, assigned_to, donor_id, is_completed')
    .eq('id', moveId)
    .eq('organization_id', organizationId)
    .single();

  if (fetchError || !move) {
    return NextResponse.json({ error: 'Move not found' }, { status: 404 });
  }

  if (move.is_completed) {
    return NextResponse.json({ error: 'Move is already completed' }, { status: 409 });
  }

  if (profile.role === 'solicitor' && move.assigned_to !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let followUpDueDate: Date | null = null;
  if (follow_up) {
    const followUpName = follow_up.name ?? follow_up.title;
    if (!followUpName || typeof followUpName !== 'string' || followUpName.trim() === '') {
      return NextResponse.json({ error: 'follow_up.name is required' }, { status: 422 });
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

  const { data: completedMove, error: updateError } = await supabase
    .from('moves')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      completion_notes: notesTrimmed || null,
    } as never)
    .eq('id', moveId)
    .select()
    .single();

  if (updateError || !completedMove) {
    console.error('Error completing move:', updateError);
    return NextResponse.json({ error: 'Failed to complete move' }, { status: 500 });
  }

  let followUpMove = null;
  if (follow_up) {
    const followUpName = (follow_up.name ?? follow_up.title ?? '').trim();
    const { data: newMove, error: followUpError } = await supabase
      .from('moves')
      .insert({
        organization_id: organizationId,
        donor_id: move.donor_id,
        assigned_to: move.assigned_to,
        move_idea_id: follow_up.move_idea_id || null,
        due_date: follow_up.due_date,
        name: followUpName,
        is_completed: false,
      } as never)
      .select()
      .single();

    if (followUpError || !newMove) {
      console.error('Error creating follow-up move:', followUpError);
      return NextResponse.json(
        { move: completedMove, warning: 'Move completed but follow-up could not be created' },
        { status: 207 }
      );
    }

    followUpMove = newMove;
  }

  return NextResponse.json({ move: completedMove, follow_up_move: followUpMove }, { status: 200 });
}
