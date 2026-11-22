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
   if(url.pathname==='/regalos-jxj.html')return route.fulfill({body:'<title>Regalos JXJ</title>',contentType:'text/html'});
   const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
   return route.fulfill({path:file}).catch(()=>route.abort());
  });
  await page.goto('http://universe.test/');
  await page.evaluate(async()=>{
   state.demo=true;
   state.profile={id:'demo-julisa',handle:'julisa',display_name:'Julissa'};
   await navigate('home');
   applySeason('christmas');
  });

  const trigger=page.locator('#mobile-menu');
  const menu=page.locator('#jj-arcade-menu');
  const shortcut=route=>menu.locator(`button[data-arcade-route="${route}"]`);
  await trigger.tap();
  await menu.waitFor();
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  assert.equal(await trigger.getAttribute('aria-controls'),'jj-arcade-menu');
  const games=menu.getByText('Juegos',{exact:true});
  const uno=shortcut('cards');
  assert.equal(await uno.isVisible(),false);
  await games.tap();
  assert.equal(await uno.isVisible(),true);
  await games.tap();
  assert.equal(await uno.isVisible(),false);
  for(const label of ['Multimedia','Nuestro rincón','Novedades y cuenta']){
   const summary=menu.locator('summary').filter({has:page.getByText(label,{exact:true})});
   await summary.tap();
   assert.equal(await summary.evaluate(node=>node.parentElement.open),true);
   await summary.tap();
  }
  assert.equal(await shortcut('gifts').isVisible(),false);
  assert.equal(await shortcut('music').isVisible(),false);

  // Recreating the shell must keep the open menu wired to current buttons.
  await page.evaluate(()=>shell());
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

  await page.evaluate(()=>{
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
  assert.equal(await trigger.getAttribute('aria-controls'),'primary-nav');
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
  assert.deepEqual(errors,[]);
  console.log('PASS: mobile touch, groups, refreshed navigation, games, new routes, permissions, English, desktop and QR gifts.');
 }finally{
  await browser.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
