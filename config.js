// Built-in API Key configuration
// Warning: Exposing keys in client-side code allows public reuse.
// Only use for demos or low-risk scenarios.
(function () {
  const BUILT_IN_API_KEY = 'V5PWW7GYB8NOTZGQ6EEF4IJL3TIGXJF3YU2L371P';
  try {
    // Seed into localStorage if no keys configured
    const LIST_KEY = 'gitee_api_keys';
    const ACTIVE_KEY = 'gitee_active_api_key_id';
    const builtinId = 'builtin';
    let list = [];
    try {
      const raw = localStorage.getItem(LIST_KEY);
      list = raw ? JSON.parse(raw) || [] : [];
    } catch {}
    const exists = Array.isArray(list) && list.some(k => k && (k.id === builtinId || k.key === BUILT_IN_API_KEY));
    if (!exists) {
      list = [...(Array.isArray(list) ? list : []), { id: builtinId, name: '内置 Key', key: BUILT_IN_API_KEY }];
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
    }
    const active = localStorage.getItem(ACTIVE_KEY);
    if (!active) {
      localStorage.setItem(ACTIVE_KEY, builtinId);
    }
    // Also expose on window for optional reads
    window.BUILT_IN_API_KEY = BUILT_IN_API_KEY;
  } catch (e) {
    // noop
  }
})();
