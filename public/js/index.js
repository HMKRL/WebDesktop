function login() {
	var id = document.getElementById('loginID').value;
	var pw = document.getElementById('loginPW').value;
	var xhttp;
	if (window.XMLHttpRequest) {
	    xhttp = new XMLHttpRequest();
	    } else {
	    // code for IE6, IE5
	    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
			var res = this.responseText.split('\r\n');
			if(res.length && res[0] != 'failed'){
				document.cookie = "loginToken=" + res[1];
				location.href = 'main.html';
			}else{
				alert("Login failed");
			}
       }
    };
    xhttp.open("POST", "login", true);
    xhttp.send(id + '\r\n' + pw);
}
