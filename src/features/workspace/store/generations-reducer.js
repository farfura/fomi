/**
 * Pure state transitions for the generation history.
 * Kept separate from the provider so the logic is easy to read and to test.
 */
export function createInitialState({ items, nextCursor }) {
  return {
    items,
    cursor: nextCursor,
    hasMore: Boolean(nextCursor),
    loadingMore: false,
    loadError: null,
    pending: [],
    favorites: [],
    removed: [],
    localIds: [],
    view: "all",
    highlightId: null,
    composerRequest: null,
    hydrated: false,
  };
}

function uniqueById(list) {
  const seen = new Set();
  return list.filter((item) => (seen.has(item.id) ? false : seen.add(item.id)));
}

export function generationsReducer(state, action) {
  switch (action.type) {
    case "hydrate": {
      const { local = [], favorites = [], removed = [] } = action.payload;
      return {
        ...state,
        items: uniqueById([...local, ...state.items]),
        localIds: local.map((item) => item.id),
        favorites,
        removed,
        hydrated: true,
      };
    }
    case "generate/start":
      return { ...state, pending: [action.payload, ...state.pending] };
    case "generate/success":
      return {
        ...state,
        pending: state.pending.filter((job) => job.id !== action.payload.jobId),
        items: [action.payload.generation, ...state.items],
        localIds: [action.payload.generation.id, ...state.localIds],
        highlightId: action.payload.generation.id,
      };
    case "generate/end":
      return { ...state, pending: state.pending.filter((job) => job.id !== action.payload.jobId) };
    case "page/start":
      return { ...state, loadingMore: true, loadError: null };
    case "page/success":
      return {
        ...state,
        loadingMore: false,
        items: uniqueById([...state.items, ...action.payload.items]),
        cursor: action.payload.nextCursor,
        hasMore: Boolean(action.payload.nextCursor),
      };
    case "page/error":
      return { ...state, loadingMore: false, loadError: action.payload };
    case "favorite/toggle": {
      const id = action.payload;
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter((item) => item !== id)
        : [id, ...state.favorites];
      return { ...state, favorites };
    }
    case "generation/remove":
      return { ...state, removed: [...state.removed, action.payload] };
    case "generation/restore":
      return { ...state, removed: state.removed.filter((id) => id !== action.payload) };
    case "view/set":
      return { ...state, view: action.payload };
    case "highlight":
      return { ...state, highlightId: action.payload };
    case "composer/request":
      return { ...state, composerRequest: { ...action.payload, nonce: Date.now() } };
    case "composer/consumed":
      return { ...state, composerRequest: null };
    default:
      return state;
  }
}
