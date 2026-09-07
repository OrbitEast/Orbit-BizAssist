function renderShell(){return `<div class="shell">${nav()}<div class="content">${topBar()}${viewForRoute()} </div></div>`}
function viewForRoute(){const views={dashboard,invoice,documents,khata,inventory,expenses,reports,staff,settings};return views[state.page]()}
function render(){if(!state.user)return $('#app').innerHTML=auth();$('#app').innerHTML=renderShell()}