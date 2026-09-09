/* 职场知识库管理原型：本地 mock 数据与交互（仅用于评审演示，非生产实现）。
   ponytail: 当前为评审用静态近似交互；取得真实上传/下载/鉴权行为证据后，再替换为目标工程接口。 */
(function () {
  'use strict';

  var TYPE_ICON = { PDF: '📕', Word: '📘', Excel: '📗', PPT: '📙', 图片: '🖼️', 视频: '🎬' };
  var OFFICE = { PDF: 1, Word: 1, Excel: 1, PPT: 1 };

  /* 本地 mock 文档数据（中性占位，无真实业务信息）。 */
  var DOCS = [
    { id: 'd1', name: '员工入职手册.pdf', type: 'PDF', category: '规章制度', size: '2.4 MB', owner: '李娜', updated: '2026-09-08', status: '已发布', note: '面向新员工的入职引导与制度说明。' },
    { id: 'd2', name: '2026年度培训计划.docx', type: 'Word', category: '培训资料', size: '1.1 MB', owner: '王强', updated: '2026-09-05', status: '已发布', note: '全年培训安排与课程体系。' },
    { id: 'd3', name: '产品需求评审纪要.docx', type: 'Word', category: '项目文档', size: '320 KB', owner: '赵敏', updated: '2026-09-03', status: '草稿', note: '本期需求范围与评审结论。' },
    { id: 'd4', name: 'Q3销售数据看板.xlsx', type: 'Excel', category: '项目文档', size: '880 KB', owner: '陈晨', updated: '2026-09-01', status: '待审核', note: '季度销售指标汇总。' },
    { id: 'd5', name: '公司VI规范.pptx', type: 'PPT', category: '产品资料', size: '5.6 MB', owner: '孙琳', updated: '2026-08-28', status: '已发布', note: '品牌视觉识别规范。' },
    { id: 'd6', name: '信息安全管理制度.pdf', type: 'PDF', category: '规章制度', size: '1.8 MB', owner: '李娜', updated: '2026-08-25', status: '已发布', note: '信息安全合规要求。' },
    { id: 'd7', name: '新人培训视频.mp4', type: '视频', category: '培训资料', size: '128 MB', owner: '王强', updated: '2026-08-20', status: '已发布', note: '入职培训录播。' },
    { id: 'd8', name: '客户拜访记录表.xlsx', type: 'Excel', category: '项目文档', size: '540 KB', owner: '陈晨', updated: '2026-08-18', status: '草稿', note: '客户跟进模板。' },
    { id: 'd9', name: '团队周报模板.docx', type: 'Word', category: '团队空间', size: '210 KB', owner: '赵敏', updated: '2026-08-15', status: '已发布', note: '周报统一格式。' },
    { id: 'd10', name: '财务报销流程图.png', type: '图片', category: '规章制度', size: '760 KB', owner: '李娜', updated: '2026-08-12', status: '已发布', note: '报销流程示意。' }
  ];

  var PAGE_SIZE = 8;
  var filters = { keyword: '', type: 'all', status: 'all', category: 'all' };
  var page = 1;
  var selection = {};

  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function typeTag(doc) {
    var cls = OFFICE[doc.type] ? 'ui-tag ui-tag--primary' : 'ui-tag';
    return '<span class="' + cls + '">' + escapeHtml(doc.type) + '</span>';
  }
  function statusTag(doc) {
    var map = { '已发布': 'ui-tag ui-tag--success', '草稿': 'ui-tag', '待审核': 'ui-tag ui-tag--warning' };
    return '<span class="' + (map[doc.status] || 'ui-tag') + '">' + escapeHtml(doc.status) + '</span>';
  }

  function filtered() {
    var kw = filters.keyword.trim().toLowerCase();
    return DOCS.filter(function (d) {
      if (kw && d.name.toLowerCase().indexOf(kw) === -1 && d.owner.toLowerCase().indexOf(kw) === -1) return false;
      if (filters.type !== 'all' && d.type !== filters.type) return false;
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.category !== 'all' && d.category !== filters.category) return false;
      return true;
    });
  }

  function renderTable() {
    var rows = filtered();
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pages) page = pages;
    var slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    var body = $('uiTableBody');
    body.innerHTML = '';
    slice.forEach(function (doc, i) {
      var checked = selection[doc.id] ? 'checked' : '';
      var rowOpsId = i === 0 ? ' id="uiDocRowActions"' : '';
      var previewIdAttr = i === 0 ? ' id="uiDocPreview" data-ui-interactive' : '';
      var popIdAttr = i === 0 ? ' id="uiDeletePopconfirm"' : '';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="ui-table-selection"><input type="checkbox" data-row-check="' + doc.id + '" aria-label="选择 ' + escapeHtml(doc.name) + '" ' + checked + '></td>' +
        '<td><div class="ui-doc-name"><span class="ui-doc-icon" aria-hidden="true">' + (TYPE_ICON[doc.type] || '📄') + '</span>' +
          '<span class="ui-doc-meta"><span>' + escapeHtml(doc.name) + '</span><small>' + escapeHtml(doc.size) + '</small></span></div></td>' +
        '<td>' + typeTag(doc) + '</td>' +
        '<td>' + escapeHtml(doc.category) + '</td>' +
        '<td><span class="ui-avatar ui-avatar--sm" aria-hidden="true"><span class="ui-avatar-text">' + escapeHtml(doc.owner.charAt(0)) + '</span></span> ' + escapeHtml(doc.owner) + '</td>' +
        '<td>' + escapeHtml(doc.updated) + '</td>' +
        '<td>' + statusTag(doc) + '</td>' +
        '<td><div class="ui-row-actions"' + rowOpsId + '>' +
          '<button class="ui-button ui-button--text" type="button" data-act="preview" data-id="' + doc.id + '"' + previewIdAttr + '>预览</button>' +
          '<button class="ui-button ui-button--text" type="button" data-act="download" data-id="' + doc.id + '">下载</button>' +
          '<span class="ui-popconfirm is-danger"><button class="ui-button ui-button--danger-text" type="button" data-act="del" data-id="' + doc.id + '" aria-controls="pc-' + doc.id + '" aria-expanded="false">删除</button>' +
            '<span class="ui-popconfirm-panel" id="pc-' + doc.id + '" role="alertdialog" ' + popIdAttr + ' hidden><p>删除后不可恢复，确认继续吗？</p>' +
            '<span class="ui-popconfirm-actions"><button class="ui-button" type="button" data-pc="cancel">取消</button>' +
            '<button class="ui-button ui-popconfirm-confirm" type="button" data-pc="ok" data-id="' + doc.id + '">确定</button></span></span></span>' +
        '</div></td>';
      body.appendChild(tr);
    });

    $('uiTableEmpty').hidden = total !== 0;
    $('uiTableWrap').classList.toggle('has-selection', Object.keys(selection).length > 0);
    $('uiPaginationInfo').textContent = '共 ' + total + ' 条';
    $('uiPageCurrent').textContent = page + ' / ' + pages;
    $('uiPagePrev').disabled = page <= 1;
    $('uiPageNext').disabled = page >= pages;
    updateSelectionHint();
    window.dispatchEvent(new CustomEvent('ui:layout-change'));
  }

  function updateSelectionHint() {
    var n = Object.keys(selection).length;
    $('uiSelectionHint').textContent = '已选 ' + n + ' 项';
    $('uiToolbarBatchDelete').disabled = n === 0;
  }

  function updateStats() {
    $('uiStatTotal').textContent = DOCS.length;
    $('uiStatPending').textContent = DOCS.filter(function (d) { return d.status === '待审核'; }).length;
  }

  /* ---- Toast ---- */
  function toast(msg, type) {
    var region = $('uiToastRegion');
    var el = document.createElement('div');
    el.className = 'ui-toast' + (type ? ' ui-toast--' + type : '');
    el.textContent = msg;
    region.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  /* ---- 下载（真实触发浏览器下载一个占位文件） ---- */
  function download(doc) {
    var content = '文档：' + doc.name + '\n类型：' + doc.type + '\n分类：' + doc.category +
      '\n创建人：' + doc.owner + '\n状态：' + doc.status + '\n说明：' + doc.note + '\n\n（演示占位内容）';
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = doc.name.replace(/\.[^.]+$/, '') + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('开始下载：' + doc.name, 'success');
  }

  /* ---- 上传弹窗 ---- */
  function openOverlay(id) { var o = $(id); o.hidden = false; o.classList.add('is-open'); o.setAttribute('aria-hidden', 'false'); }
  function closeOverlay(id) { var o = $(id); o.hidden = true; o.classList.remove('is-open'); o.setAttribute('aria-hidden', 'true'); }

  function openUpload() {
    $('uiUploadList').innerHTML = '';
    $('uiUploadName').value = '';
    $('uiUploadTags').value = '';
    $('uiUploadDesc').value = '';
    openOverlay('uiUploadModal');
    if (window.PrototypeViewers) window.PrototypeViewers.patchState({ 'kb.layers': ['upload'] });
  }
  function closeUpload() {
    closeOverlay('uiUploadModal');
    if (window.PrototypeViewers) window.PrototypeViewers.patchState({ 'kb.layers': [] });
  }

  var uploadFiles = [];
  function addUploadFile(name, size) {
    uploadFiles.push({ name: name, size: size });
    var li = document.createElement('li');
    li.className = 'ui-upload-list-item';
    li.innerHTML = '<div class="ui-upload-list-item-name">' + escapeHtml(name) + '（' + escapeHtml(size) + '）</div>' +
      '<div class="ui-upload-list-item-progress"><span style="width:0%"></span></div>';
    $('uiUploadList').appendChild(li);
    var bar = li.querySelector('span');
    var p = 0;
    var timer = setInterval(function () {
      p += 12 + Math.random() * 18;
      if (p >= 100) { p = 100; clearInterval(timer); }
      bar.style.width = p + '%';
    }, 220);
  }

  function confirmUpload() {
    var name = $('uiUploadName').value.trim();
    var cat = $('uiUploadCat').querySelector('select').value;
    if (uploadFiles.length === 0 && !name) { toast('请先选择文件或填写文档名称', 'error'); return; }
    if (uploadFiles.length === 0) uploadFiles.push({ name: name || '未命名文档', size: '—' });
    uploadFiles.forEach(function (f, idx) {
      DOCS.unshift({
        id: 'u' + Date.now() + idx,
        name: name && uploadFiles.length === 1 ? name : f.name,
        type: guessType(f.name),
        category: cat,
        size: f.size,
        owner: '我',
        updated: '2026-09-09',
        status: '草稿',
        note: $('uiUploadDesc').value.trim() || '—'
      });
    });
    uploadFiles = [];
    closeUpload();
    page = 1;
    updateStats();
    renderTable();
    toast('已上传 ' + uploadFiles.length + ' 个文档', 'success');
  }
  function guessType(fn) {
    var ext = (fn.split('.').pop() || '').toLowerCase();
    var m = { pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', ppt: 'PPT', pptx: 'PPT', png: '图片', jpg: '图片', jpeg: '图片', gif: '图片', mp4: '视频' };
    return m[ext] || 'PDF';
  }

  /* ---- 预览抽屉 ---- */
  var previewDoc = null;
  function openPreview(id) {
    var doc = DOCS.filter(function (d) { return d.id === id; })[0];
    if (!doc) return;
    previewDoc = doc;
    $('uiPreviewName').textContent = doc.name;
    $('uiPreviewType').textContent = doc.type;
    $('uiPreviewSize').textContent = doc.size;
    $('uiPreviewCat').textContent = doc.category;
    $('uiPreviewOwner').textContent = doc.owner;
    $('uiPreviewStatus').textContent = doc.status;
    $('uiPreviewUpdated').textContent = doc.updated;
    $('uiPreviewNote').textContent = doc.note;
    $('uiPreviewThumb').textContent = TYPE_ICON[doc.type] || '📄';
    $('uiPreviewContent').textContent = '「' + doc.name + '」在线预览区（演示占位）。实际系统在此渲染文档内容或嵌入预览。';
    openOverlay('uiPreviewDrawer');
    if (window.PrototypeViewers) window.PrototypeViewers.patchState({ 'kb.layers': ['preview'] });
  }
  function closePreview() {
    closeOverlay('uiPreviewDrawer');
    previewDoc = null;
    if (window.PrototypeViewers) window.PrototypeViewers.patchState({ 'kb.layers': [] });
  }

  /* ---- 删除（二次确认） ---- */
  function removeDoc(id) {
    for (var i = DOCS.length - 1; i >= 0; i--) if (DOCS[i].id === id) DOCS.splice(i, 1);
    delete selection[id];
    updateStats();
    renderTable();
    toast('已删除文档', 'success');
  }

  /* ---- 分类筛选 ---- */
  function setCategory(cat) {
    filters.category = cat;
    page = 1;
    document.querySelectorAll('.ui-tree-leaf').forEach(function (b) { b.classList.toggle('is-active', b.dataset.cat === cat); });
    document.querySelectorAll('.ui-menu-item').forEach(function (b) { b.classList.toggle('is-active', (b.dataset.cat || '') === cat); });
    renderTable();
  }

  /* ---- 事件绑定 ---- */
  function bind() {
    // 筛选
    $('uiFilterSearchBtn').addEventListener('click', function () {
      filters.keyword = $('uiFilterKeyword').value;
      filters.type = $('uiFilterType').querySelector('select').value;
      filters.status = $('uiFilterStatus').querySelector('select').value;
      page = 1; renderTable();
    });
    $('uiFilterKeyword').addEventListener('input', function () { filters.keyword = this.value; });
    $('uiFilterResetBtn').addEventListener('click', function () {
      filters = { keyword: '', type: 'all', status: 'all', category: 'all' };
      $('uiFilterKeyword').value = '';
      $('uiFilterType').querySelector('select').value = 'all';
      $('uiFilterStatus').querySelector('select').value = 'all';
      setCategory('all');
    });

    // 工具栏
    $('uiToolbarUpload').addEventListener('click', openUpload);
    $('uiToolbarBatchDelete').addEventListener('click', function () {
      var ids = Object.keys(selection);
      if (!ids.length) return;
      ids.forEach(removeDoc);
      toast('已批量删除 ' + ids.length + ' 个文档', 'success');
    });
    $('uiToolbarRefresh').addEventListener('click', function () { renderTable(); toast('已刷新列表'); });
    $('uiToolbarNewCat').addEventListener('click', function () { toast('演示：可在分类管理中新建分类'); });
    $('uiToolbarExport').addEventListener('click', exportCsv);

    // 表头全选
    document.querySelector('[data-selection-all]').addEventListener('change', function (e) {
      var slice = filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      slice.forEach(function (d) { if (e.target.checked) selection[d.id] = true; else delete selection[d.id]; });
      renderTable();
    });

    // 表格事件委托
    $('uiTableBody').addEventListener('click', function (e) {
      var t = e.target;
      if (t.dataset && t.dataset.rowCheck !== undefined) {
        if (t.checked) selection[t.dataset.rowCheck] = true; else delete selection[t.dataset.rowCheck];
        renderTable(); return;
      }
      var act = t.dataset && t.dataset.act;
      if (act === 'preview') { openPreview(t.dataset.id); return; }
      if (act === 'download') { var d = DOCS.filter(function (x) { return x.id === t.dataset.id; })[0]; if (d) download(d); return; }
      if (act === 'del') {
        var panel = document.getElementById('pc-' + t.dataset.id);
        var open = panel.hidden;
        document.querySelectorAll('.ui-popconfirm-panel').forEach(function (p) { p.hidden = true; });
        panel.hidden = !open;
        t.setAttribute('aria-expanded', String(open));
        return;
      }
      if (t.dataset && t.dataset.pc === 'cancel') { t.closest('.ui-popconfirm-panel').hidden = true; return; }
      if (t.dataset && t.dataset.pc === 'ok') { removeDoc(t.dataset.id); return; }
    });

    // 上传弹窗
    $('uiUploadModalClose').addEventListener('click', closeUpload);
    $('uiUploadModalCancel').addEventListener('click', closeUpload);
    $('uiUploadModalConfirm').addEventListener('click', confirmUpload);
    $('uiUploadPick').addEventListener('click', function () { $('uiUploadInput').click(); });
    $('uiUploadInput').addEventListener('change', function (e) {
      Array.prototype.forEach.call(e.target.files, function (f) { addUploadFile(f.name, (f.size / 1024).toFixed(0) + ' KB'); });
    });
    var drop = $('uiUploadDrop');
    ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.style.borderColor = 'var(--ui-primary)'; }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.style.borderColor = ''; }); });
    drop.addEventListener('drop', function (e) {
      Array.prototype.forEach.call(e.dataTransfer.files, function (f) { addUploadFile(f.name, (f.size / 1024).toFixed(0) + ' KB'); });
    });

    // 预览抽屉
    $('uiPreviewClose').addEventListener('click', closePreview);
    $('uiPreviewDownload').addEventListener('click', function () { if (previewDoc) download(previewDoc); });

    // 遮罩点击关闭
    ['uiUploadModal', 'uiPreviewDrawer'].forEach(function (id) {
      $(id).addEventListener('click', function (e) { if (e.target === this) (id === 'uiUploadModal' ? closeUpload : closePreview)(); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!$('uiUploadModal').hidden) closeUpload(); if (!$('uiPreviewDrawer').hidden) closePreview(); }
    });

    // 分页
    $('uiPagePrev').addEventListener('click', function () { if (page > 1) { page--; renderTable(); } });
    $('uiPageNext').addEventListener('click', function () { page++; renderTable(); });

    // 分类导航
    document.querySelectorAll('.ui-tree-leaf').forEach(function (b) { b.addEventListener('click', function () { setCategory(b.dataset.cat); }); });
    document.querySelectorAll('.ui-menu-item[data-cat]').forEach(function (b) { b.addEventListener('click', function () { setCategory(b.dataset.cat); }); });
    document.querySelectorAll('.ui-tree-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var expanded = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!expanded));
        var target = document.getElementById(b.getAttribute('aria-controls'));
        if (target) target.hidden = expanded;
      });
    });
  }

  function exportCsv() {
    var rows = filtered();
    var head = ['文档名称', '类型', '分类', '创建人', '更新时间', '状态'];
    var csv = '﻿' + head.join(',') + '\n' + rows.map(function (d) {
      return [d.name, d.type, d.category, d.owner, d.updated, d.status].map(function (v) { return '"' + v + '"'; }).join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = '知识库清单.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('已导出 ' + rows.length + ' 条清单', 'success');
  }

  function init() {
    bind();
    updateStats();
    renderTable();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
