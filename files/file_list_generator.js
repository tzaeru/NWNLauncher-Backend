var tomlify = require('tomlify-j0.4');
var fs = require('fs');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var toml_dump = "";
var file_object = {};

file_object["server_ip"] = "104.155.20.124:5121";

toml_dump += 'server_ip = "104.155.20.124:5121"\n\n'

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function file_checksum(file)
{ 
  console.log("\nChecksumming for: " + file);
  read = fs.readFileSync(file);
  hash = checksum(read)
  return hash;
}

var create_hash = function(file)
{
  // the file you want to get the hash    
  var fd = fs.createReadStream(file);
  var hash = crypto.createHash('md5');
  hash.setEncoding('hex');

  fd.on('end', function() {
      hash.end();
      console.log(hash.read()); // the desired sha1sum
  });

  // read all file and pipe it (write it) to the hash object
  fd.pipe(hash);

  return hash;
}

var create_file_entry = function(name, url)
{
  entry = {}
  
  target_name = name
  src_name = name
  
  if (url == "portraits")
    target_name = target_name.replace(".tar.gz", ".tga");
  else if (name.indexOf(".tar.gz") > -1)
    return null
  else
  {
    try
    {
      if (fs.statSync(url + "/" + name + ".tar.gz"))
      {
        console.log("Exists: ", url + name + ".tar.gz");
        src_name = src_name + ".tar.gz";
      }
    }
    catch(err)
    {
      console.log("Doesn't exist: ", url + name + ".tar.gz");
    }
  }
  
  entry["name"] = target_name;
  entry["version"] = 1;
  entry["url"] = "~" + url + '/' + src_name;
  entry["target_dir"] = url;
  entry["target_file"] = target_name;

  if ("target_dir" != "portraits")
    entry["checksum"] = file_checksum('./' + url + '/' + target_name);
  entry["size"] = fs.statSync('./' + url + '/' + src_name)["size"];
  entry["src_file"] = src_name

  console.log("Created entry for: " + src_name);
  console.log("Checksum: " + entry["checksum"]);

  return entry;
}

var walk_directory = function(directory)
{
  files = fs.readdirSync(directory)
  var i = 0;
  
  for (i = 0; i < files.length; i++)
  {
    global.gc();
  
    var ext = path.extname(files[i]).toLowerCase();
    if (files[i] === ".gitignore" || ext === ".py" || (ext === ".tga" && directory === "portraits"))
      continue;
    
    var entry = create_file_entry(files[i], directory);
    if (entry == null)
      continue;
    file_object[entry.name] = entry;
  }
}

walk_directory("hak");
walk_directory("erf");
walk_directory("tlk");
walk_directory("dmvault");
walk_directory("portraits");
walk_directory("override");
walk_directory("music");

//fs.writeFile("files.toml", toml_dump);
//console.log(file_object);

fs.writeFile("files.toml",
  tomlify(file_object,
  function (key, value) {
        if (key == "version")
          return value.toFixed(0);
        return false;  // Let tomlify decide for you.
    }
  , 2));