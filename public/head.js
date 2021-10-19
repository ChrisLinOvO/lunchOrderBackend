const socket = io();
let gb_Auth = '';        
//判斷Query有e
if(getParameterByName('e')==null)window.location.href = './err/noAuth';
else {
  const nQry = '?'+  atob( getParameterByName('e') );

  //判斷atobed Query有a, d
  if( getParameterByName('a',nQry) == null || getParameterByName('d',nQry) == null )window.location.href = './err/noAuth?txt=沒有登入參數';

  socket.emit('create', 'authentication', {
    strategy: 'local',
    email: getParameterByName('a',nQry),
    password: getParameterByName('d',nQry)
  }, function(error, authResult) {
    console.log('LogInnn:',authResult);
    if(!authResult || !authResult.user || !authResult.user.loginTime)window.location.href = './err/noAuth?txt=沒有登入時間,請洽管理員';
    console.log('時間比:',new Date().getTime() < authResult.user.loginTime);

    gb_Auth =  authResult.user.auth ? authResult.user.auth : '';
    const route = window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split('?')[0];
    if(route == '' && gb_Auth!=='user')window.location.href = './err/noAuth?txt=沒有此頁面之權限-使用者';
    if(route == 'seller.html' && gb_Auth!=='seller')window.location.href = './err/noAuth?txt=沒有此頁面之權限-商家';    

    // authResult will be {"accessToken": "your token", "user": user }
    // You can now send authenticated messages to the server
  });

}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}