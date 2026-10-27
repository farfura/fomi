/**
 * State for the Direction Studio. The project (shots, takes, notes, DNA) is the document;
 * everything else is view state.
 */
export function createInitialState(project) {
  return {
    project,
    activeShotId: project.activeShotId ?? project.shots[0]?.id,
    selection: Object.fromEntries(project.shots.map((shot) => [shot.id, shot.takes.at(-1)?.id ?? null])),
    tool: "view",
    pending: null,
    hydrated: false,
  };
}

function updateShot(state, shotId, update) {
  return {
    ...state,
    project: {
      ...state.project,
      shots: state.project.shots.map((shot) => (shot.id === shotId ? update(shot) : shot)),
    },
  };
}

function updateTake(state, shotId, takeId, update) {
  return updateShot(state, shotId, (shot) => ({
    ...shot,
    takes: shot.takes.map((take) => (take.id === takeId ? update(take) : take)),
  }));
}

export function studioReducer(state, action) {
  switch (action.type) {
    case "hydrate": {
      const saved = action.payload;
      if (!saved?.project) return { ...state, hydrated: true };
      return {
        ...state,
        project: saved.project,
        activeShotId: saved.activeShotId ?? state.activeShotId,
        selection: { ...state.selection, ...saved.selection },
        hydrated: true,
      };
    }
    case "reset":
      return { ...createInitialState(action.payload), hydrated: true };
    case "shot/select":
      return { ...state, activeShotId: action.payload, tool: "view" };
    case "take/select": {
      const { shotId, takeId } = action.payload;
      return { ...state, selection: { ...state.selection, [shotId]: takeId } };
    }
    case "tool/set":
      return { ...state, tool: action.payload };
    case "take/approve": {
      // A shot delivers exactly one take, so circling a take releases the previous pick.
      const { shotId, takeId } = action.payload;
      return updateShot(state, shotId, (shot) => {
        const wasApproved = shot.takes.find((take) => take.id === takeId)?.approved;
        return {
          ...shot,
          takes: shot.takes.map((take) => ({ ...take, approved: take.id === takeId ? !wasApproved : false })),
        };
      });
    }
    case "note/add": {
      const { shotId, takeId, note } = action.payload;
      return updateTake(state, shotId, takeId, (take) => ({ ...take, notes: [...take.notes, note] }));
    }
    case "note/remove": {
      const { shotId, takeId, noteId } = action.payload;
      return updateTake(state, shotId, takeId, (take) => ({
        ...take,
        notes: take.notes.filter((note) => note.id !== noteId),
      }));
    }
    case "iterate/start":
      return { ...state, pending: action.payload };
    case "iterate/success": {
      const { shotId, takes } = action.payload;
      const next = updateShot(state, shotId, (shot) => ({ ...shot, takes: [...shot.takes, ...takes] }));
      return {
        ...next,
        pending: null,
        tool: "view",
        selection: { ...next.selection, [shotId]: takes[0]?.id ?? next.selection[shotId] },
      };
    }
    case "iterate/end":
      return { ...state, pending: null };
    case "dna/update":
      return {
        ...state,
        project: { ...state.project, dna: { ...state.project.dna, ...action.payload } },
      };
    case "dna/lock": {
      const field = action.payload;
      const { locks } = state.project.dna;
      return {
        ...state,
        project: {
          ...state.project,
          dna: { ...state.project.dna, locks: { ...locks, [field]: !locks[field] } },
        },
      };
    }
    default:
      return state;
  }
}

/* Selectors ------------------------------------------------------------------ */

export function selectActiveShot(state) {
  return state.project.shots.find((shot) => shot.id === state.activeShotId) ?? state.project.shots[0];
}

export function selectActiveTake(state) {
  const shot = selectActiveShot(state);
  const id = state.selection[shot.id];
  return shot.takes.find((take) => take.id === id) ?? shot.takes.at(-1) ?? null;
}

export function selectParentTake(state) {
  const shot = selectActiveShot(state);
  const take = selectActiveTake(state);
  return take?.parentId ? (shot.takes.find((item) => item.id === take.parentId) ?? null) : null;
}

export function isShotApproved(shot) {
  return shot.takes.some((take) => take.approved);
}
