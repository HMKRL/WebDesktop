var windows = [];
var footers = [];
var curDrag = null;

function ajax(method, path, msg, callback) {
	var xhttp;
	if (window.XMLHttpRequest) {
	    xhttp = new XMLHttpRequest();
	    } else {
	    // code for IE6, IE5
	    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
       }
    };
    xhttp.open(method, path, true);
    xhttp.send(msg);
}

function loadContent(obj, fileName) {
	ajax("GET", fileName, "", (res) => {
		obj.innerHTML = res;
	})
}

function initTerminal(windowObj, content) {
	ajax("GET", 'shell.html', "", (res) => {
		content.innerHTML = res;
		ajax("POST", "shell", '~', (msg) => {
			var res = msg.split('\r\n');
			if(res[0] == 'success'){
				content.setAttribute('shellId', res[1]);
				content.getElementsByClassName('hostLine')[0].innerHTML = res[2] + " $";
			}else{
				alert("Shell error:\n" + res[0]);
				windowObj.parentElement.removeChild(windowObj);
				var index = windows.findIndex((cur) => {
					return cur == windowObj;
				})
				windows.splice(index, 1);
				var footer = footers[index];
				footer.parentElement.removeChild(footer);
				footers.splice(index, 1);
			}
		})
		windowObj.keyEvent = shellPress;
	})
}

function initFile(windowObj, content) {
	loadContent(content, 'file.html');
}

function menuClick(e) {
	if(document.getElementById('menu').style.display == 'none'){
		document.getElementById('menu').style.display = 'block';
	}else{
		document.getElementById('menu').style.display = 'none';
	}
	e.stopPropagation();
}

function bodyClick() {
	document.getElementById('menu').style.display = 'none';
}

function windowPull(obj) {
    var index = windows.findIndex((cur) => {
        return cur == obj
    })
    windows.splice(index, 1)
    windows.push(obj)
    for (var i = 0; i < windows.length; i++) {
        windows[i].style.zIndex = 90+i
    }
}

function windowMove(e) {
    var obj = curDrag;
	if(obj){
	    var x = parseInt(obj.getAttribute('lastX'));
	    var px = obj.getAttribute('lastpX');
	    x += e.pageX - parseInt(px);
	    obj.parentElement.style.left = x.toString() + 'px';
	    var y = parseInt(obj.getAttribute('lastY'));
	    var py = obj.getAttribute('lastpY');
	    y += e.pageY - parseInt(py);
	    obj.parentElement.style.top = y.toString() + 'px';
	    obj.setAttribute('lastpX', e.pageX);
	    obj.setAttribute('lastX', x);
	    obj.setAttribute('lastY', y);
	    obj.setAttribute('lastpY', e.pageY);
	}
}

function windowUp(){
    if(curDrag && curDrag.parentElement.getAttribute('windowState') == 'normal'){
        curDrag.removeEventListener('mousemove', windowMove);
		curDrag = null;
    }
}

function windowDown(e) {
	if(e.target.parentElement.getAttribute('windowState') == 'normal'){
        e.target.setAttribute('lastX', e.target.parentElement.offsetLeft);
        e.target.setAttribute('lastpX', e.pageX);
        e.target.setAttribute('lastY', e.target.parentElement.offsetTop);
        e.target.setAttribute('lastpY', e.pageY);
        windowPull(e.target.parentElement);
		curDrag = e.target;
	}
}

function windowClose(e) {
    var obj = e.target.parentElement.parentElement;
    obj.parentElement.removeChild(obj);
    var index = windows.findIndex((cur) => {
        return cur == obj;
    })
    windows.splice(index, 1);
	var footer = footers[index];
	footer.parentElement.removeChild(footer);
	footers.splice(index, 1);
	var shellId = obj.children[1].getAttribute('shellId');
	ajax("POST", "command", shellId + '\r\nexit', (msg) => {

	})
}

function maxTransEnd(e) {
    var obj = e.target;
    obj.style.transition = 'none';
    obj.removeEventListener('transitionend', maxTransEnd);
}

function windowMax(e) {
    var obj = e.target.parentElement.parentElement;
    if(obj.getAttribute('windowState') == 'normal'){
        obj.style.transition = 'all ease 0.5s';
        obj.addEventListener('transitionend', maxTransEnd);
        obj.setAttribute('laststate', JSON.stringify({
            top: obj.offsetTop,
            left: obj.offsetLeft,
            width: obj.offsetWidth,
            height: obj.offsetHeight,
            state: 'normal'
        }))
        obj.style.top = '0';
        obj.style.left = '0';
        obj.style.width = '100%';
        obj.style.height = '95%';
        e.target.className = 'fa fa-compress';
        obj.setAttribute('windowstate', 'maximal');
        windowPull(obj);
    }else{
        obj.style.transition = 'all ease 0.5s';
        obj.addEventListener('transitionend', maxTransEnd);
        e.target.className = 'fa fa-expand';
        var old = JSON.parse(obj.getAttribute('laststate'));
        obj.style.top = old.top + 'px';
        obj.style.left = old.left + 'px';
        obj.style.width = old.width + 'px';
        obj.style.height = old.height + 'px';
        obj.setAttribute('windowState', 'normal');
    }
}

function minTransEnd(e) {
    var obj = e.target;
    obj.style.transition = 'none';
    obj.style.display = 'none';
    obj.style.opacity = '1';
    obj.removeEventListener('transitionend', minTransEnd);
}

function windowMin(e) {
    var obj = e.target.parentElement.parentElement;
    obj.style.transition = 'all ease 0.3s';
    obj.addEventListener('transitionend', minTransEnd);
    if(obj.getAttribute('windowstate') == 'normal'){
        obj.setAttribute('laststate', JSON.stringify({
            top: obj.offsetTop,
            left: obj.offsetLeft,
            width: obj.offsetWidth,
            height: obj.offsetHeight,
            state: 'normal'
        }))
    }else{
        var old = JSON.parse(obj.getAttribute('laststate'));
        old.state = 'maximal';
        obj.setAttribute('laststate', JSON.stringify(old));
    }
	obj.style.opacity = '0';
	obj.setAttribute('windowstate', 'minimal');
}

function itemClick(e, titleStr) {
	// Window
	var windowObj = document.createElement('DIV');
    windowObj.className = 'window';
    windowObj.setAttribute('windowState', 'normal');
    windowObj.setAttribute('windowId', windows.length);
    var bar = document.createElement('DIV');
	bar.className = 'windowBar';
    bar.addEventListener('mousedown',windowDown);
	var title = document.createElement('B');
    title.innerHTML = titleStr;
	bar.appendChild(title);
    var i = document.createElement('I');
    i.className = 'fa fa-close';
	i.addEventListener('click',windowClose);
    bar.appendChild(i);
    i = document.createElement('I');
    i.className = 'fa fa-expand';
	i.addEventListener('click',windowMax);
    bar.appendChild(i);
    i = document.createElement('I');
    i.className = 'fa fa-minus';
	i.addEventListener('click',windowMin);
    bar.appendChild(i);
	windowObj.appendChild(bar);
    var content = document.createElement('DIV');
	if(titleStr == 'Terminal'){
		initTerminal(windowObj, content);
	}else if(titleStr == 'File Browser'){
		initFile(windowObj, content);
	}else if(titleStr == 'Text Editor'){
	}else if(titleStr == 'Compile'){
	}
	windowObj.appendChild(content);
	// Footer
	var fooObj = document.createElement('DIV');
	fooObj.className = 'windowFoo';
    fooObj.setAttribute('windowId', windows.length);
	i = document.createElement('I');
	if(titleStr == 'Terminal'){
		i.className = 'fa fa-terminal';
	}else if(titleStr == 'File Browser'){
		i.className = 'fa fa-folder';
	}else if(titleStr == 'Text Editor'){
		i.className = 'fa fa-file-text';
	}else if(titleStr == 'Compile'){
		i.className = 'fa fa-gears';
	}
	fooObj.addEventListener('click',fooClick);
    fooObj.appendChild(i);
	title = document.createElement('B');
    title.innerHTML = titleStr;
	fooObj.appendChild(title);
	// Push
    document.getElementById('desktop').appendChild(windowObj)
    windows.push(windowObj)
	document.getElementById('footer').appendChild(fooObj)
    footers.push(fooObj)
    for (var i = 0; i < windows.length; i++) {
        windows[i].style.zIndex = 90+i
    }
	var maxW = document.getElementById('footer').offsetWidth * 0.93;
	for (var i = 0; i < footers.length; i++) {
        footers[i].style.width = Math.round(maxW / footers.length).toString() + 'px';
    }
}

function fooClick(e) {
	windows.forEach((win) => {
		if(win.getAttribute('windowId') == e.target.getAttribute('windowId')){
			if(win.getAttribute('windowstate') == 'minimal'){
				// Restore
	            win.style.transition = 'all ease 0.5s';
	            win.style.display = 'block';
	            win.addEventListener('transitionend', maxTransEnd);
	            var old = JSON.parse(win.getAttribute('laststate'));
	            if(old.state == 'normal'){
	                win.style.top = old.top + 'px';
	                win.style.left = old.left + 'px';
	                win.style.width = old.width + 'px';
	                win.style.height = old.height + 'px';
	                win.setAttribute('windowstate', 'normal');
	            }else{
	                win.style.top = '0';
	                win.style.left = '0';
	                win.style.width = '100%';
	                win.style.height = '95%';
	                win.setAttribute('windowstate', 'maximal');
	            }
	            windowPull(win);
			}else{
				// Minimal
				win.style.transition = 'all ease 0.3s';
			    win.addEventListener('transitionend', minTransEnd);
			    if(win.getAttribute('windowstate') == 'normal'){
			        win.setAttribute('laststate', JSON.stringify({
			            top: win.offsetTop,
			            left: win.offsetLeft,
			            width: win.offsetWidth,
			            height: win.offsetHeight,
			            state: 'normal'
			        }))
			    }else{
			        var old = JSON.parse(win.getAttribute('laststate'));
			        old.state = 'maximal';
			        win.setAttribute('laststate', JSON.stringify(old));
			    }
				win.style.opacity = '0';
				win.setAttribute('windowstate', 'minimal');
			}
		}
	})
}

function keyEvent(e) {
	if (windows.length) {
		var active = windows[windows.length - 1];
		active.keyEvent(e, active);
	}
}
