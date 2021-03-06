function speedupJSDomReady(callback) {

    var called = false;

    function deRegister() {
        if (document.removeEventListener) {
            document.removeEventListener("DOMContentLoaded", readyStateCheck);
        } else if (document.detachEvent) {
            document.detachEvent("onreadystatechange", readyStateCheck);
        }
    }

    function readyStateCheck() {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            deRegister();
            if (!called) {
                called = true;
                callback();
            }
            return true;
        }
    }

    function defer(method) {
        if (!readyStateCheck()) {
            setTimeout(function () {
                defer(method)
            }, 50);
        }
    }

    if (!readyStateCheck()) {
        if (window.__cfRocketOptions) {
            //Rocket loader wont give DOMContentLoaded. We are on our own.
            defer(callback);
        }
        else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", readyStateCheck);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", readyStateCheck);
        }
    }
}

speedupJSDomReady(function () {
    var allNodes = document.querySelectorAll('[type="text/speedupscript"], [type="text/speedupcss"]')
    function executer(index) {
        if(index < allNodes.length){
            execute(allNodes[index], function(){
                executer(index+1)
            })
        }
    }
    function execute(element, callback){
        try{
            if(element.type == 'text/speedupscript'){
                if(element.src){
                    var script = document.createElement('script');
                    script.type = "text/javascript";
                    script.src = element.src;
                    script.async = true;
                    script.onload = function(){
                        callback()
                    }
                    document.head.appendChild(script);
                }
                else if(element.innerText){
                    var code = element.innerText;
                    code = new Function(code)
                    code()
                    callback()
                }
            }
            else if(element.type == 'text/speedupcss'){
                if(element.href){
                    var link = document.createElement('link');
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.onload = function(){
                        callback()
                    }
                    link.href = element.href;
                    element.parentNode.insertBefore(link,element)
                }
                else{
                    var link = document.createElement('style');
                    link.type = "text/css";
                    link.innerText = element.innerText;
                    link.innerHTML = element.innerHTML;
                    element.parentNode.insertBefore(link,element)
                    callback()
                }
            }
        }
        catch(e){
            console.log(e)
        }
    }
    executer(0)
})