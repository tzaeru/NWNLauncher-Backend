var koa = require('koa');
var app = koa();
var serve = require('koa-static');
var subdomain = require('koa-sub-domain');
var _ = require('koa-route');
var os = require('os');
var path = require('path');
var parse = require('co-busboy');
var fs = require('fs');
var toml = require('toml');
var mv = require('mv');
 
/*app.use(subdomain('potm',function *(next){
  this.body = 'Hey, you got it :-)';
}));*/

var config_string = fs.readFileSync('./config.toml', 'utf-8');
var config = toml.parse(config_string);

app.use(function *(next){
  // ignore non-POSTs
  if ('POST' != this.method) return yield next;

  // multipart upload
  var parts = parse(this);
  var part;

  //if (config["password"] != )

  var allow_upload = false;

  var uploaded_files = [];

  while (part = yield parts) {
    if (part.length)
    {
        if (part[1] == config["password"])
        {
            allow_upload = true;
            continue;
        }
    }

    if (allow_upload == false)
    {
        console.log("Password mismatch.")
        return yield next;
    }

    var stream = fs.createWriteStream(path.join(os.tmpdir(), part.filename));
    part.pipe(stream);
    console.log('uploading %s -> %s', part.filename, stream.path);
    uploaded_files.push(part.filename);
  }
  console.log(uploaded_files);

  var i = 0;
  for (i = 0; i < uploaded_files.length; i++)
  {
    var target_sub_dir = path.extname(uploaded_files[i]);
    target_sub_dir = target_sub_dir.substring(1);
    if (target_sub_dir == "bic")
        target_sub_dir = "dmvault";
    
    mv(path.join(os.tmpdir(), uploaded_files[i]), './files/' + target_sub_dir + '/' + uploaded_files[i], function(err) {
        if (err)
            console.log("Error in moving file, " + err);
        // done. it tried fs.rename first, and then falls back to
        // piping the source file to the dest file and then unlinking
        // the source file.
    });
  }

  this.redirect('/');
});

app.use(serve('files'));

app.listen(2020);