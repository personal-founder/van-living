const preferenceKey='van-living-viewer-ui-v1';

export function readSidebarPreference(storage) {
  try {return JSON.parse(storage.getItem(preferenceKey))?.sidebarCollapsed===true;}catch{return false;}
}

export function setSidebarCollapsed({main,sidebar,toggle,storage},collapsed) {
  const hidden=Boolean(collapsed);
  main.classList.toggle('sidebar-collapsed',hidden);sidebar.hidden=hidden;
  toggle.setAttribute('aria-expanded',String(!hidden));
  toggle.textContent=hidden?'Show controls':'Hide controls';
  if(hidden&&sidebar.contains(sidebar.ownerDocument.activeElement))toggle.focus();
  try {storage.setItem(preferenceKey,JSON.stringify({sidebarCollapsed:hidden}));}catch{}
}

export function compactSidebar(sidebar) {
  const document=sidebar.ownerDocument;
  const overview=sidebar.querySelector('#summary');
  if(overview?.parentElement===sidebar) {
    const details=document.createElement('details');const summary=document.createElement('summary');
    summary.textContent='Vehicle overview';details.append(summary);overview.before(details);details.append(overview);
  }
  for(const section of [...sidebar.children].filter(child=>child.tagName==='DETAILS')) {
    section.open=Boolean(section.querySelector('#layers'));
    if(!section.querySelector('input,select,button,#layers,#dimension-groups'))continue;
    const paragraphs=[...section.children].filter(child=>child.tagName==='P'&&!['lighting-summary','water-tank-summary'].includes(child.id));
    if(!paragraphs.length)continue;
    const notes=document.createElement('details');notes.className='section-notes';
    const summary=document.createElement('summary');summary.textContent='Notes';notes.append(summary,...paragraphs);section.append(notes);
    if(section.id==='utility-controls') {
      const warning=document.createElement('p');warning.className='hint estimate';
      warning.textContent='Storage only. Never run or auto-start generators inside.';notes.before(warning);
    }
  }
  const reference=document.createElement('details');const title=document.createElement('summary');
  title.textContent='Reference & safety notes';reference.append(title);
  for(const paragraph of [...sidebar.children].filter(child=>child.tagName==='P'&&!child.classList.contains('intro')))reference.append(paragraph);
  const intro=sidebar.querySelector('.intro');
  if(intro){const original=intro.cloneNode(true);reference.append(original);intro.textContent='Starcraft Allstar XL · reference model.';}
  if(reference.children.length>1)sidebar.append(reference);
  const notice=document.createElement('p');notice.className='hint estimate';notice.textContent='Reference model—not a fabrication blueprint.';
  if(intro)intro.after(notice);
}

export function installViewerUI(document) {
  const sidebar=document.getElementById('sidebar');
  const main=sidebar.parentElement;const toggle=document.getElementById('toggle-sidebar');
  compactSidebar(sidebar);
  let storage;
  try {storage=document.defaultView.localStorage;}catch{storage=null;}
  const elements={main,sidebar,toggle,storage};
  setSidebarCollapsed(elements,readSidebarPreference(storage));
  toggle.addEventListener('click',()=>setSidebarCollapsed(elements,!sidebar.hidden));
  const header=document.querySelector('header');
  const resize=()=>document.documentElement.style.setProperty('--header-height',`${header.getBoundingClientRect().height}px`);
  new document.defaultView.ResizeObserver(resize).observe(header);resize();
}
