/* DeepLink PPT Studio — 静态交互 Demo(纯前端,无后端依赖)
 * SVG 渲染逻辑移植自 ppt-studio/deeplink_style.py,配色/版式与正式工具完全一致。
 * 真实 AI 生成与 PPTX 导出需本地运行完整版;本 Demo 内置示例内容(mock)。
 */

/* ================= 设计常量 ================= */
const C = {
  PRIMARY: "#0339C4", BORDER: "#C9D4E8",
  TEXT_MAIN: "#333333", TEXT_CARD: "#444444", TEXT_MUTED: "#666666",
  WHITE: "#FFFFFF", LIGHTBLUE: "#9DC1F5",
  FONT: "Microsoft YaHei", MONO: "Consolas, Microsoft YaHei",
  W: 1280, H: 720,
};
const LAYOUTS = [["cards","卡片网格"],["list","编号列表"],["split","左右分栏"],["numbers","数字大条"],["timeline","流程步骤"]];
const HEADER_HTML =
  `<image href="assets/header_strip.png" x="0" y="0" width="1280" height="30" preserveAspectRatio="xMidYMid meet"/>` +
  `<image href="assets/logo_deeplink.png" x="894" y="2" width="106" height="26" preserveAspectRatio="xMidYMid meet"/>` +
  `<text x="1262" y="19" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="end">Shanghai Artificial Intelligence Laboratory</text>`;

function esc(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function wrap(text, per) {
  text = String(text ?? "");
  const lines = []; let cur = "";
  for (const ch of text) { cur += ch; if (cur.length >= per) { lines.push(cur); cur = ""; } }
  if (cur) lines.push(cur);
  return lines;
}
function footer(pageNo) {
  return `<g class="footer"><text x="38" y="703" font-size="15" fill="#666666">www.shlab.org.cn</text>` +
         `<text x="1216" y="703" font-size="15" fill="#666666" text-anchor="end">${pageNo}</text></g>`;
}

/* ================= 页面渲染 ================= */
function coverSvg(main, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" font-family="${C.FONT}">
  <image href="assets/cover_bg.png" x="0" y="0" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/>
  <g id="cover-title">
    <text x="152" y="340" font-size="80" font-weight="bold" fill="#FFFFFF">${esc(main)}<tspan x="152" dy="105">${esc(sub)}</tspan></text>
  </g>
</svg>`;
}

function endingSvg(l1, l2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" font-family="${C.FONT}">
  <image href="assets/cover_bg.png" x="0" y="0" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/>
  <g id="ending-title" fill="#FFFFFF" font-size="53" font-weight="bold" text-anchor="middle">
    <text x="640" y="280">${esc(l1)}</text>
    <text x="640" y="360">${esc(l2)}</text>
  </g>
  <g id="qr1"><image href="assets/qr_website.png" x="284" y="421" width="130" height="130"/><text x="349" y="600" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">官方网站</text></g>
  <g id="qr2"><image href="assets/qr_zhihu.png" x="572" y="421" width="130" height="130"/><text x="637" y="600" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">知乎账号</text></g>
  <g id="qr3"><image href="assets/qr_repo.png" x="877" y="421" width="130" height="130"/><text x="942" y="600" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">开源仓库</text></g>
</svg>`;
}

function textBlock(x, y, size, fill, lines, step, anchor) {
  const a = anchor ? ` text-anchor="${anchor}"` : "";
  let t = `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}"${a}>${esc(lines[0])}`;
  for (let i = 1; i < lines.length; i++) t += `<tspan x="${x}" dy="${step}">${esc(lines[i])}</tspan>`;
  return t + "</text>";
}

/* —— 卡片网格 —— */
function card(x, y, w, h, idx, title, detail) {
  const big = h > 200, cx = x + 36;
  const cy = y + (big ? 38 : 34), ny = y + (big ? 44 : 40), ty = y + (big ? 86 : 74);
  const by = y + (big ? 132 : 102), step = big ? 28 : 26;
  let s = `<g class="card">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#FFFFFF" stroke="#C9D4E8" stroke-width="1"/>
  <rect x="${x}" y="${y}" width="${w}" height="4" fill="#0339C4"/>
  <circle cx="${cx}" cy="${cy}" r="15" fill="#0339C4"/>
  <text x="${cx}" y="${ny}" font-family="${C.MONO}" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${String(idx).padStart(2,"0")}</text>`;
  if (title) s += `<text x="${cx}" y="${ty}" font-size="24" font-weight="bold" fill="#0339C4">${esc(title)}</text>`;
  const b = y + (big ? 132 : (title ? 102 : 66));
  const lines = wrap(detail, Math.max(8, Math.floor((w - 72) / 20))).slice(0, 3);
  if (lines.length) s += textBlock(cx, b, 20, "#444444", lines, step);
  return s + "</g>";
}
function bodyCards(points) {
  const n = points.length; let out = "";
  if (n <= 3) { [88,472,856].slice(0,n).forEach((x,i)=> out += card(x,290,356,330,i+1,points[i].title,points[i].detail)); }
  else if (n === 4) { points.forEach((p,i)=>{ out += card(i%2?472:88, i<2?278:482, 356, 196, i+1, p.title, p.detail); }); }
  else { points.forEach((p,i)=>{ if(i<3) out += card([88,472,856][i],278,356,196,i+1,p.title,p.detail);
    else out += card(i===3?240:660,482,i===3?380:380,196,i+1,p.title,p.detail); }); }
  return out;
}

/* —— 编号列表 —— */
function bodyList(points) {
  const n = Math.min(points.length, 4); let out = ""; const y0 = 272, rh = 100;
  for (let i = 0; i < n; i++) {
    const y = y0 + i*rh, p = points[i], cx = 105;
    out += `<g class="li">
    <circle cx="${cx}" cy="${y+30}" r="15" fill="#0339C4"/>
    <text x="${cx}" y="${y+36}" font-family="${C.MONO}" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${String(i+1).padStart(2,"0")}</text>`;
    let dx = 132;
    if (p.title) { out += `<text x="132" y="${y+32}" font-size="24" font-weight="bold" fill="#0339C4">${esc(p.title)}</text>`; dx = 340; }
    const lines = wrap(p.detail, 38).slice(0,3);
    if (lines.length) out += textBlock(dx, y+32, 20, "#444444", lines, 28);
    if (i < n-1) out += `<line x1="88" y1="${y+92}" x2="1192" y2="${y+92}" stroke="#C9D4E8" stroke-width="1"/>`;
    out += "</g>";
  }
  return out;
}

/* —— 左右分栏 —— */
function bodySplit(points, intro) {
  let out = `<g class="split-left">
    <rect x="88" y="262" width="380" height="368" rx="8" fill="#0339C4"/>
    <text x="118" y="310" font-family="${C.MONO}" font-size="16" font-weight="bold" fill="#9DC1F5">OVERVIEW</text>`;
  const il = wrap(intro, 14).slice(0,3);
  if (il.length) out += textBlock(118, 360, 22, "#FFFFFF", il, 36);
  else out += `<text x="118" y="380" font-size="22" fill="#FFFFFF">价值概述</text>`;
  out += "</g>";
  const n = Math.min(points.length, 4), y0 = 262, rh = 100;
  for (let i = 0; i < n; i++) {
    const y = y0 + i*rh, p = points[i], cx = 525;
    out += `<g class="sp">
    <circle cx="${cx}" cy="${y+30}" r="15" fill="#0339C4"/>
    <text x="${cx}" y="${y+36}" font-family="${C.MONO}" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${String(i+1).padStart(2,"0")}</text>`;
    let dx = 544;
    if (p.title) { out += `<text x="544" y="${y+32}" font-size="24" font-weight="bold" fill="#0339C4">${esc(p.title)}</text>`; dx = 752; }
    const lines = wrap(p.detail, 20).slice(0,3);
    if (lines.length) out += textBlock(dx, y+32, 20, "#444444", lines, 28);
    out += "</g>";
  }
  return out;
}

/* —— 数字大条 —— */
function bodyNumbers(points) {
  const n = points.length;
  let xs, ys, ws, hs;
  if (n <= 3) { xs=[88,472,856].slice(0,n); ys=[310,310,310].slice(0,n); ws=[356,356,356].slice(0,n); hs=[320,320,320].slice(0,n); }
  else if (n === 4) { xs=[88,472,88,472]; ys=[278,278,482,482]; ws=[356,356,356,356]; hs=[196,196,196,196]; }
  else { xs=[88,472,856,240,660]; ys=[278,278,278,482,482]; ws=[356,356,356,380,380]; hs=[196,196,196,196,196]; }
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = xs[i], y = ys[i], w = ws[i], h = hs[i], p = points[i], big = h > 200;
    out += `<g class="nb">
    <text x="${x+36}" y="${y+(big?86:64)}" font-family="${C.MONO}" font-size="52" font-weight="bold" fill="#0339C4">${String(i+1).padStart(2,"0")}</text>`;
    let ty, dy, step;
    if (big) { ty = y+150; dy = y+196; step = 28; } else { ty = y+104; dy = y+128; step = 26; }
    if (p.title) { out += `<text x="${x+36}" y="${ty}" font-size="24" font-weight="bold" fill="#444444">${esc(p.title)}</text>`; }
    else { dy = ty + 4; }
    const lines = wrap(p.detail, Math.max(8, Math.floor((w-72)/20))).slice(0,3);
    if (lines.length) out += textBlock(x+36, dy, 20, "#666666", lines, step);
    out += `<rect x="${x+36}" y="${y+h-6}" width="72" height="4" fill="#0339C4"/></g>`;
  }
  return out;
}

/* —— 流程步骤 —— */
function bodyTimeline(points) {
  const n = Math.min(points.length, 4);
  const cxs = n === 3 ? [300,640,980] : [226,502,778,1054];
  const yline = 340;
  let out = `<g class="tl-line"><line x1="${cxs[0]}" y1="${yline}" x2="${cxs[cxs.length-1]}" y2="${yline}" stroke="#C9D4E8" stroke-width="3"/></g>`;
  for (let i = 0; i < n; i++) {
    const cx = cxs[i], p = points[i];
    out += `<g class="tl">
    <circle cx="${cx}" cy="${yline}" r="15" fill="#0339C4"/>
    <circle cx="${cx}" cy="${yline}" r="23" fill="none" stroke="#C9D4E8" stroke-width="2"/>`;
    let dy;
    if (p.title) { out += `<text x="${cx}" y="${yline+56}" font-size="24" font-weight="bold" fill="#0339C4" text-anchor="middle">${esc(p.title)}</text>`; dy = yline+88; }
    else { dy = yline+64; }
    const lines = wrap(p.detail, 10).slice(0,3);
    if (lines.length) out += textBlock(cx, dy, 18, "#444444", lines, 24, "middle");
    out += "</g>";
  }
  return out;
}

function introBlock(intro) {
  const lines = wrap(intro, 40).slice(0,2);
  if (lines.length === 1) return `<text x="88" y="245" font-size="24" fill="#333333">${esc(lines[0])}</text>`;
  return textBlock(88, 240, 24, "#333333", lines, 30);
}

function contentSvg(pageNo, title, intro, points, layout) {
  let body;
  if (layout === "list") body = bodyList(points);
  else if (layout === "split") body = bodySplit(points, intro);
  else if (layout === "numbers") body = bodyNumbers(points);
  else if (layout === "timeline") body = bodyTimeline(points);
  else body = bodyCards(points);
  const introHtml = layout === "split" ? "" : introBlock(intro);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" font-family="${C.FONT}">
  <rect x="0" y="0" width="1280" height="720" fill="#FFFFFF"/>
  ${HEADER_HTML}
  <text x="88" y="140" font-size="43" font-weight="bold" fill="#0339C4">${esc(title)}</text>
  ${introHtml}
  ${body}
  ${footer(pageNo)}
</svg>`;
}

/* ================= Mock 生成(移植自 llm.py) ================= */
const MOCK_EXAMPLES = [
  { match:["kernelswift","算子","kernel"],
    page_title:"KernelSwift:意义与价值",
    intro:"KernelSwift 智能算子生成工具,让国产异构算力的算子开发更高效、更自主。",
    points:[
      {title:"开发提效", detail:"算子生成与迁移效率大幅提升,显著缩短算子开发与适配周期,让团队专注业务创新"},
      {title:"硬件适配", detail:"快速适配国产新芯片新架构,新硬件接入后能第一时间获得算子能力支持"},
      {title:"降低门槛", detail:"降低算子开发与性能优化门槛,让更多开发者参与到国产算力生态中来"},
      {title:"生态协同", detail:"与昇腾等伙伴联合发布共建生态,推动国产异构算力产业整体向前发展"},
    ]},
  { match:["混训","混推","混合训练","异构"],
    page_title:"异构混训/混推:价值",
    intro:"生产级国产异构算力混合训练与推理方案,算力不被单一硬件绑定。",
    points:[
      {title:"算力协同", detail:"多元异构芯片协同训练推理,让不同厂商 AI 芯片可以一起完成大模型任务"},
      {title:"降本增效", detail:"充分释放存量算力资源,避免硬件重复建设,显著降低总体算力成本"},
      {title:"自主可控", detail:"减少对单一硬件厂商的依赖,供应链更安全,技术路线选择更灵活"},
      {title:"生产可用", detail:"已在真实场景规模落地,经受了生产级训练的稳定性与性能考验"},
    ]},
  { match:["超节点","白皮书"],
    page_title:"超节点技术体系:价值",
    intro:"发布超节点技术体系白皮书,为大规模算力集群提供体系化技术方案。",
    points:[
      {title:"体系化", detail:"从芯片到集群的全栈技术体系,为大规模算力建设提供完整方法论"},
      {title:"规模化", detail:"支撑万卡级算力集群建设,满足大模型训练对超大规模算力的需求"},
      {title:"生态共建", detail:"与主流国产芯片厂商深度适配共建,联合推动产业生态走向成熟"},
      {title:"行业参考", detail:"为产业界提供可复制的建设范式,助力全国一体化算力网络落地"},
    ]},
];
function mockGenerate(req) {
  req = String(req || "").toLowerCase();
  for (const ex of MOCK_EXAMPLES) if (ex.match.some(k => req.includes(k))) return JSON.parse(JSON.stringify(ex));
  return { page_title:(req||"页面主题").slice(0,14), intro:`围绕「${req}」的核心价值,面向听众做简洁专业的说明。`,
    points:[
      {title:"价值一", detail:"直接服务业务目标,产生实际价值,帮助团队把资源用在关键方向上"},
      {title:"价值二", detail:"降低使用门槛,提升整体效率,让更多人能够快速上手并使用起来"},
      {title:"价值三", detail:"夯实自主能力,支撑长期发展,为后续演进留下充分的技术空间"},
    ]};
}

/* ================= 应用状态与交互 ================= */
const DEFAULT_DECK = {
  cover:{main:"DeepLink", sub:"多元算力软件基座"},
  pages:[
    {title:"品牌背景", intro:"DeepLink 是上海人工智能实验室技术品牌,面向多元异构算力,提供从算子到训练推理的完整软件栈。", layout:"cards",
     points:[{title:"品牌来源",detail:"上海人工智能实验室官方技术品牌,承载算力软件基座使命"},{title:"面向场景",detail:"多元异构算力,覆盖训练与推理部署全流程"},{title:"覆盖范围",detail:"从算子生成到训练推理的完整软件栈"}]},
    {title:"KernelSwift 智能算子生成", intro:"面向国产异构算力的智能算子生成/迁移工具,算子迁移效率大幅提升。", layout:"numbers",
     points:[{title:"产品定位",detail:"智能算子生成与迁移,面向国产异构算力平台"},{title:"落地成效",detail:"算子迁移效率大幅提升,显著缩短适配周期"},{title:"核心价值",detail:"快速适配新硬件,降低算子开发门槛"},{title:"生态协同",detail:"联合昇腾等伙伴发布,共建算子生态"}]},
    {title:"异构混训 / 混推", intro:"生产级国产异构算力混合训练与推理加速方案。", layout:"list",
     points:[{title:"异构混训",detail:"多元异构芯片协同训练,让不同厂商 AI 芯片一起完成大模型任务"},{title:"异构混推",detail:"生产级国产异构算力推理,推理不被单一硬件绑定"},{title:"自主可控",detail:"减少对单一硬件厂商依赖,供应链更安全灵活"}]},
    {title:"超节点技术体系与生态合作", intro:"发布超节点技术体系白皮书,与主流国产芯片厂商深度适配共建生态。", layout:"timeline",
     points:[{title:"超节点体系",detail:"《超节点技术体系》白皮书正式发布"},{title:"硬件生态",detail:"华为昇腾 · 平头哥 · 沐曦 · 壁仞"},{title:"开发者生态",detail:"KernelSwift 算子创新大赛"},{title:"开源共建",detail:"AI4S 算子优化赛共建"}]},
  ],
  ending:{line1:"感谢聆听", line2:"欢迎交流合作"},
};
let deck = JSON.parse(JSON.stringify(DEFAULT_DECK));
let current = 0;
const $ = id => document.getElementById(id);

function globalPages() {
  const list = [{type:"cover", title: deck.cover.sub || "封面"}];
  deck.pages.forEach(p => list.push({type:"content", title: p.title || "新页面"}));
  list.push({type:"ending", title:"封底"});
  return list;
}
const fmtNo = i => String(i+1).padStart(2,"0");

function renderList() {
  const list = globalPages();
  $("pageCount").textContent = list.length;
  $("pageList").innerHTML = list.map((p,i)=>{
    let extra = "";
    if (p.type === "content") {
      extra = `<button class="mv" onclick="event.stopPropagation();movePage(${i},-1)" title="上移">↑</button>
               <button class="mv" onclick="event.stopPropagation();movePage(${i},1)" title="下移">↓</button>
               <button class="del" onclick="event.stopPropagation();delPage(${i})" title="删除">✕</button>`;
    }
    return `<div class="page-item ${i===current?"active":""}" onclick="switchTo(${i})">
      <span class="no">${fmtNo(i)}</span><span class="t">${esc(p.title)}</span>${extra}</div>`;
  }).join("");
}

function renderEditor() {
  const p = globalPages()[current];
  let html = `<h2>${fmtNo(current)} · ${p.type==="cover"?"封面":p.type==="ending"?"封底":"内容页"}</h2>`;
  if (p.type === "cover") {
    const c = deck.cover;
    html += `<label class="f">主标题</label><input id="covMain" value="${esc(c.main)}" maxlength="20">
      <label class="f">副标题(本次 PPT 主题,≤10字)</label><input id="covSub" value="${esc(c.sub)}" maxlength="10">`;
  } else if (p.type === "ending") {
    const e = deck.ending;
    html += `<label class="f">封底第一行</label><input id="end1" value="${esc(e.line1)}" maxlength="24">
      <label class="f">封底第二行</label><input id="end2" value="${esc(e.line2)}" maxlength="24">`;
  } else {
    const pg = deck.pages[current-1];
    html += `<div class="hint">💡 输入“该页内容要求”，演示模式用内置示例内容生成 3~5 条价值点(可修改)；完整版接入真实大模型。</div>
      <label class="f">输入该页内容要求</label>
      <div class="req-row">
        <input id="requirement" placeholder="例如：KernelSwift 算子生成工具的意义跟价值" maxlength="80">
        <button class="btn" onclick="genContent()">✦ 生成内容</button>
      </div>
      <label class="f">排版样式</label>
      <div class="layout-pick" id="layoutPick">
        ${LAYOUTS.map(([v,label]) => `<button class="lp ${pg.layout===v?"active":""}" data-l="${v}" onclick="pickLayout('${v}')">${label}</button>`).join("")}
      </div>
      <label class="f">页面标题</label><input id="pageTitle" value="${esc(pg.title)}" maxlength="30">
      <label class="f">引导句</label><input id="pageIntro" value="${esc(pg.intro)}" maxlength="80">
      <label class="f">价值点(3~5 条)</label>
      <div class="points-wrap" id="pointsWrap"></div>
      <button class="btn ghost" onclick="addPoint()">＋ 添加条目</button>`;
  }
  $("editor").innerHTML = html;
  if (p.type === "content") renderPoints();
  renderPreview();
}

function renderPoints() {
  const pg = deck.pages[current-1];
  const pts = pg.points || (pg.points = []);
  $("pointsWrap").innerHTML = pts.map((pt,i)=>`
    <div class="point-row">
      <span class="idx">${i+1}</span>
      <input class="p-title" placeholder="要点名(≤8字)" value="${esc(pt.title)}" maxlength="12" oninput="editPoint(${i},'title',this.value)">
      <input class="p-detail" placeholder="一句话说明(≤60字,可排3行)" value="${esc(pt.detail)}" maxlength="120" oninput="editPoint(${i},'detail',this.value)">
      <button class="rm" onclick="delPoint(${i})">✕</button>
    </div>`).join("");
}
function editPoint(i, field, val) { const p = deck.pages[current-1]; if (p && p.points[i]) p.points[i][field] = val; }
function addPoint() { const pg = deck.pages[current-1]; pg.points.push({title:"",detail:""}); renderPoints(); }
function delPoint(i) { const pg = deck.pages[current-1]; pg.points.splice(i,1); renderPoints(); }

function collectForm() {
  const p = globalPages()[current];
  if (p.type==="cover") { deck.cover.main = $("covMain")?.value ?? deck.cover.main; deck.cover.sub = $("covSub")?.value ?? deck.cover.sub; }
  else if (p.type==="ending") { deck.ending.line1 = $("end1")?.value ?? deck.ending.line1; deck.ending.line2 = $("end2")?.value ?? deck.ending.line2; }
  else { const pg = deck.pages[current-1]; if (pg) { pg.title = $("pageTitle")?.value ?? pg.title; pg.intro = $("pageIntro")?.value ?? pg.intro; } }
}

function switchTo(i) { collectForm(); current = i; renderList(); renderEditor(); }
function addPage() { collectForm(); deck.pages.push({title:"新页面",intro:"",points:[{title:"",detail:""},{title:"",detail:""},{title:"",detail:""}],layout:"cards"}); current = deck.pages.length; renderList(); renderEditor(); }
function delPage(i) { deck.pages.splice(i-1,1); if (current > deck.pages.length) current = deck.pages.length; renderList(); renderEditor(); }
function movePage(i, dir) {
  const a = i-1, b = a+dir;
  if (a<0 || b<0 || b>=deck.pages.length) return;
  const t = deck.pages[a]; deck.pages[a]=deck.pages[b]; deck.pages[b]=t;
  if (current === i) current = b+1; else if (current === b+1) current = i;
  renderList(); renderEditor();
}
function pickLayout(l) {
  const pg = deck.pages[current-1]; if (!pg) return;
  pg.layout = l;
  document.querySelectorAll("#layoutPick .lp").forEach(b => b.classList.toggle("active", b.dataset.l === l));
  renderPreview();
}
function genContent() {
  const req = $("requirement").value.trim();
  if (!req) { alert("请先输入该页内容要求。"); return; }
  const j = mockGenerate(req);
  const pg = deck.pages[current-1];
  pg.title = j.page_title; pg.intro = j.intro; pg.points = j.points;
  $("pageTitle").value = pg.title; $("pageIntro").value = pg.intro;
  renderPoints(); renderPreview();
}

function renderPreview() {
  collectForm();
  const p = globalPages()[current];
  let svg;
  if (p.type === "cover") svg = coverSvg(deck.cover.main, deck.cover.sub);
  else if (p.type === "ending") svg = endingSvg(deck.ending.line1, deck.ending.line2);
  else { const pg = deck.pages[current-1]; svg = contentSvg(current+1, pg.title, pg.intro, pg.points, pg.layout); }
  $("preview").innerHTML = svg;
  $("previewNo").textContent = `第 ${fmtNo(current)} / ${fmtNo(globalPages().length)} 页`;
}

renderList();
renderEditor();
