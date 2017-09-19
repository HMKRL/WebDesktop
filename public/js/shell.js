function shellPress(e, obj) {
	var pres = obj.getElementsByClassName('shellcmd');
	var pre = pres[pres.length - 1];
	console.log(`${e.charCode} ${e.keyCode} ${e.key}`);
	if(e.key.length == 1){
		pre.innerHTML += e.key;
	}else if(e.key == "Space"){
		pre.innerHTML += ' ';
	}else if(e.key == "Backspace"){
		pre.innerHTML = pre.innerHTML.slice(0, pre.innerHTML.length - 1);
	}else if(e.key == "Enter"){
		var shellId = pre.parentElement.parentElement.parentElement.getAttribute('shellId');
		ajax("POST", "command", shellId + '\r\n' + pre.innerHTML, (msg) => {
			msg = msg.replace(/\[0m/g, "</b>");
			//blue
			msg = msg.replace(/\[01;30m/g, "<b style='color:rgb(  0,   0,   0);'>");
			//blue
			msg = msg.replace(/\[01;31m/g, "<b style='color:rgb(255, 130, 130);'>");
			//blue
			msg = msg.replace(/\[01;32m/g, "<b style='color:rgb(154, 255, 145);'>");
			//blue
			msg = msg.replace(/\[01;33m/g, "<b style='color:rgb(255, 254, 138);'>");
			//blue
			msg = msg.replace(/\[01;34m/g, "<b style='color:rgb(144, 182, 255);'>");
			//blue
			msg = msg.replace(/\[01;35m/g, "<b style='color:rgb(249, 149, 233);'>");
			//blue
			msg = msg.replace(/\[01;36m/g, "<b style='color:rgb(140, 217, 255);'>");
			//blue
			msg = msg.replace(/\[01;37m/g, "<b style='color:rgb(255, 255, 255);'>");
			pre.innerHTML += "\n" + msg;
			var win = pre.parentElement.parentElement;
			var i = win.getElementsByTagName('i')[0];
			win.insertBefore(document.createElement('BR'),i);
			var sectObj = document.createElement('DIV');
			sectObj.className = 'shellSect';
			var hostLines = obj.getElementsByClassName('hostLine');
			var b = document.createElement('B');
			b.className = "hostLine";
			b.innerHTML = hostLines[hostLines.length - 1].innerHTML;
			sectObj.appendChild(b);
			var npre = document.createElement('PRE');
			npre.className = 'shellcmd';
			sectObj.appendChild(npre);
			win.insertBefore(sectObj,i);
			win.scrollTop = win.scrollHeight;
		})
	}
}
