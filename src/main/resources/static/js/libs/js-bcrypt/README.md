js-bcrypt
=========
Bower wrap of the javascript port of Bcrypt.

jsBCrypt is an implementation of BCrypt written in JavaScript.

It uses Components of the ISAAC. It is based upon jBCrypt

Usage Example:
``` javascript
function result(hash){
        $("#hash").val(hash);
}
function crypt(){
        var salt;
        if($("#salt").val().length != 0){
                salt = $("#salt").val();
        }else{
                try{
                        salt = bcrypt.gensalt($("#rounds").val());
                }catch(err){
                        alert(err);
                        return;
                }
                $("#salt").val(salt);
        }
        try{

                bcrypt.hashpw($("#password").val(), $("#salt").val(), result, function() {});
        }catch(err){
                alert(err);
                return;
        }
}
```
