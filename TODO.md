# Admin Panel Tab Persistence Plan

**Status:** Plan approved, ready to implement

**Information Gathered:**
- controllers/adminController.js: POST handlers redirect to hardcoded sections (addItem → ?section=menu, updateOrderStatus → ?section=orders)
- Issue: After form submits, `req.query.section` not available; defaults to 'overview'
- Need: Extract section from referer/query, pass to res.render/redirect

**Detailed Plan:**
1. **controllers/adminController.js:**
   - Add `getSection(req)` helper: parse req.query.section || req.headers.referer || 'overview'
   - Update ALL POST handlers: `const section = getSection(req);` then `res.redirect(\`/admin/panel?section=\${section}\`)`
   - Examples:
     - addItem, updateItemStock, updateItem → return to 'menu'
     - updateOrderStatus → return to 'orders'

2. **views/admin-panel.ejs:** Already has conditional highlighting `<% section === 'menu' ? 'active' : '' %>`

**Dependent Files:**
- controllers/adminController.js (edit redirects)

**Follow-up:**
- Test: Add item → stays on Menu tab; update order → stays on Orders tab
- Run server, browser test forms

✅ COMPLETE: Added `getCurrentSection()` helper to adminController.js
✅ Updated ALL POST redirects (addItem, updateStock, updateItem, updateOrderStatus, getEditItem fallback):
  `res.redirect(\`/admin/panel?section=\${getCurrentSection(req)}\`)`

**How it works:**
- Parses req.query.section (URL param) OR req.headers.referer OR defaults
- After ANY admin operation, stays on current tab (add item → stays Menu tab)
- Sidebar highlighting works server-side + client-side clicks

**Test:**
1. `npm start`
2. /admin/panel?section=menu → Add item → stays on Menu tab highlighted
3. Update order status → stays on Orders tab

Admin panel tab persistence fixed! 🎉
