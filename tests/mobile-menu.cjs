'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');

async function main(){
 const browser=await chromium.launch({
  executablePath:process.env.PW_CHROMIUM_PATH,
  args:process.env.PW_CHROMIUM_PATH?['--no-sandbox','--no-zygote','--single-process']:[]
 });
 try{
  const page=await browser.newPage({
   viewport:{width:360,height:640},isMobile:true,hasTouch:true,
   locale:'es-MX',serviceWorkers:'block'
  });
  page.setDefaultTimeout(7000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.stack));
  const root=path.resolve(__dirname,'..');
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.hostname!=='universe.test')return route.abort();
   // A failed seasonal stylesheet must not leave the mobile menu unstyled.
   if(['/jj-christmas-interface.css','/jj-christmas-notices.css'].includes(url.pathname))return route.abort();
   if(url.pathname==='/regalos-jxj.html')return route.fulfill({body:'<title>Regalos JXJ</title>',contentType:'text/html'});
   const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
   return route.fulfill({path:file}).catch(()=>route.abort());
  });
  await page.goto('https://universe.test/');
  await page.evaluate(async()=>{
   state.demo=true;
   state.profile={id:'demo-julisa',handle:'julisa',display_name:'Julissa'};
   await navigate('home');
   applySeason('christmas');
  });

  const trigger=page.locator('#mobile-menu');
  const menu=page.locator('#jj-arcade-menu');
  const shortcut=route=>menu.locator(`button[data-arcade-route="${route}"]`);
  async function assertMenuRoutes(){
   // Every available main section has exactly one mobile entry, including closed groups.
   const routeLists=await page.evaluate(()=>{
    const routes=(selector,key)=>[...document.querySelectorAll(selector)]
     .filter(button=>!button.hidden&&!button.disabled)
     .map(button=>button.dataset[key]).sort();
    return {
     desktop:routes('#primary-nav button[data-nav]','nav'),
     mobile:routes('#jj-arcade-menu button[data-arcade-route]','arcadeRoute')
    };
   });
   assert.deepEqual(routeLists.mobile,routeLists.desktop);
  }
  await trigger.tap();
  await menu.waitFor();
  const layout=await menu.evaluate(dialog=>({
   display:getComputedStyle(dialog).display,
   bottom:Math.round(dialog.getBoundingClientRect().bottom),
   viewport:window.innerHeight,
   shortcuts:getComputedStyle(dialog.querySelector('.arcade-quick')).display,
   overflow:getComputedStyle(dialog.querySelector('.arcade-body')).overflowY
  }));
  assert.deepEqual(layout,{display:'flex',bottom:layout.viewport,viewport:layout.viewport,shortcuts:'grid',overflow:'auto'});
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  assert.equal(await trigger.getAttribute('aria-controls'),'jj-arcade-menu');
  await menu.getByRole('heading',{name:'Juntos en otra aventura'}).waitFor();
  await menu.getByText('Juega con Julie',{exact:true}).waitFor();
  await shortcut('yuki').filter({hasText:'Primer aniversario'}).waitFor();
  await assertMenuRoutes();
  await page.evaluate(()=>{
   JJSections.values.yuki=false;
   paintSectionVisibility();
  });
  await shortcut('yuki').waitFor({state:'hidden'});
  await page.evaluate(()=>{
   JJSections.values.yuki=true;
   paintSectionVisibility();
  });
  await shortcut('yuki').waitFor();
  assert.equal(await page.locator('#primary-nav').isVisible(),false);
  const games=menu.locator('summary').filter({hasText:'Arena'});
  const uno=shortcut('cards');
  assert.equal(await uno.isVisible(),false);
  await games.tap();
  assert.equal(await uno.isVisible(),true);
  await games.tap();
  assert.equal(await uno.isVisible(),false);
  for(const label of ['Sala multimedia','Nuestro rincón','Novedades y cuenta']){
   const summary=menu.locator('summary').filter({has:page.getByText(label,{exact:true})});
   await summary.tap();
   assert.equal(await summary.evaluate(node=>node.parentElement.open),true);
   await summary.tap();
  }
  assert.equal(await shortcut('gifts').isVisible(),false);
  assert.equal(await shortcut('music').isVisible(),false);

  // Recreating the shell must keep the open menu wired to current buttons.
  await page.evaluate(()=>shell());
  await games.tap();
  await shortcut('vs').tap();
  await page.waitForFunction(()=>state.page==='vs');
  await menu.waitFor({state:'detached'});
  await page.locator('[data-universe-route="piano"]').waitFor();
  await trigger.tap();
  await shortcut('games').tap();
  await page.locator('[data-universe-route="wordsearch"]').waitFor();
  await page.locator('[data-universe-route="wordsearch"]').tap();
  await page.waitForFunction(()=>JJHistory.current?.game==='wordsearch');
  await page.locator('#jj-page-back').tap();
  await page.locator('[data-universe-route="wordsearch"]').waitFor();

  await trigger.tap();
  await page.evaluate(()=>{
   menus.push(['test-new-section','◇','Apartado de prueba']);
   JJSections.values['test-new-section']=false;
   shell();
  });
  const more=menu.getByText('Más apartados',{exact:true});
  assert.equal(await more.isVisible(),false);
  assert.equal(await shortcut('test-new-section').isVisible(),false);
  await page.evaluate(()=>{
   JJSections.values['test-new-section']=true;
   paintSectionVisibility();
   document.querySelector('[data-nav="test-new-section"]').onclick=()=>navigate('home');
  });
  await more.tap();
  await shortcut('test-new-section').tap();
  await page.waitForFunction(()=>state.page==='home');
  await menu.waitFor({state:'detached'});

  // WebViews without showModal still open the same panel instead of the legacy grid.
  await page.evaluate(()=>{
   window.menuShowModal=HTMLDialogElement.prototype.showModal;
   HTMLDialogElement.prototype.showModal=undefined;
  });
  await trigger.tap();
  await menu.getByRole('heading',{name:'Juntos en otra aventura'}).waitFor();
  assert.equal(await menu.evaluate(node=>node.classList.contains('arcade-fallback')),true);
  assert.equal(await page.locator('#primary-nav').isVisible(),false);
  await page.keyboard.press('Escape');
  await menu.waitFor({state:'detached'});
  assert.equal(await trigger.evaluate(node=>document.activeElement===node),true);
  await trigger.tap();
  await shortcut('games').tap();
  await page.waitForFunction(()=>state.page==='games');
  await menu.waitFor({state:'detached'});
  await page.evaluate(async()=>{
   HTMLDialogElement.prototype.showModal=window.menuShowModal;
   await navigate('home');
   UniverseI18n.setLanguage('en');
   applySeason('classic');
   state.demo=false;
   loadSections=async()=>{};
   paintSectionVisibility();
  });
  await trigger.tap();
  await menu.getByRole('heading',{name:'Our universe'}).waitFor();
  await menu.getByRole('button',{name:'Close menu'}).tap();
  await menu.waitFor({state:'detached'});
  assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  assert.equal(await trigger.getAttribute('aria-controls'),'jj-arcade-menu');
  await page.setViewportSize({width:1000,height:720});
  assert.equal(await trigger.isVisible(),false);
  await page.locator('#primary-nav [data-nav=home]').waitFor();
  await page.setViewportSize({width:360,height:640});
  await trigger.tap();
  await menu.getByText('Our corner',{exact:true}).tap();
  await Promise.all([
   page.waitForURL('**/regalos-jxj.html#view=scan&lang=en&from=home'),
   shortcut('regalos-jxj').tap()
  ]);
  await page.goto('https://universe.test/');
  await page.evaluate(()=>{
   state.profile={id:'test-owner',handle:'jesus',display_name:'Jesús'};
   UniverseI18n.setLanguage('es');
   localStorage.setItem('nuestro-universo.yuki.visible.test-owner','false');
   const previousRpc=rpc;
   rpc=async(name,args)=>{
    if(name==='yuki_event')return {unlocked:false,step:0,visible:false};
    return previousRpc(name,args);
   };
   loadSections=async()=>{};
   applySeason('christmas');
   shell();
  });
  await trigger.tap();
  await menu.waitFor();
  await assertMenuRoutes();
  await shortcut('yuki').filter({hasText:'Yuki'}).tap();
  await page.locator('.yuki-event').getByRole('heading',{name:'Primer aniversario'}).waitFor();
  await menu.waitFor({state:'detached'});
  assert.deepEqual(errors,[]);
  console.log('PASS: mobile touch, groups, refreshed navigation, games, new routes, permissions, English, desktop and QR gifts.');
 }finally{
  await browser.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
