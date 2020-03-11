AFRAME.registerComponent('markerhandler', {

    init: function() {
        const animatedMarker = document.querySelector("#animated-marker");
        const aEntity = document.querySelector("#animated-model");

        // every click, we make our model grow in size :)
        animatedMarker.addEventListener('click', function(ev, target){
            const intersectedElement = ev && ev.detail && ev.detail.intersectedEl;
            if (aEntity && intersectedElement === aEntity) {
                const objModel = aEntity.getAttribute('obj-model');
                var treeNumber = Number((JSON.stringify(objModel).match(/\d/g)[1]+""+JSON.stringify(objModel).match(/\d/g)[2]));
                treeNumber = treeNumber+10;   
                if(treeNumber==15){
                  aEntity.setAttribute('obj-model', 'obj: #tree10-obj; mtl: #tree10-mtl;');
                  throw'';
                }             
                if(treeNumber>50){ 
                  aEntity.setAttribute('obj-model', 'obj: #tree05-obj; mtl: #tree05-mtl;'); 
                }
                else {
                  console.log('obj: #tree'+treeNumber+'-obj; mtl: #tree'+treeNumber+'-mtl;');
                  aEntity.setAttribute('obj-model', 'obj: #tree'+treeNumber+'-obj; mtl: #tree'+treeNumber+'-mtl;');
                }         
            }
        });
	}
});