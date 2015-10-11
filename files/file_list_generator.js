var tomlify = require('tomlify-j0.4');
var fs = require('fs');
var fs = require('fs');
var crypto = require('crypto');

var toml_dump = "";
var file_object = {};

file_object["server_ip"] = "104.155.20.124:5121";
file_object["files"] = []

toml_dump += 'server_ip = "104.155.20.124:5121"\n\n'

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function file_checksum(file)
{ 
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
  entry["name"] = name;
  entry["version"] = 1;
  entry["url"] = "~" + url + '/' + name;
  entry["target_dir"] = url;
  entry["target_file"] = name;
  entry["checksum"] = file_checksum('./' + url + '/' + name);

  console.log("Created entry for: " + name);
  console.log("Checksum: " + entry["checksum"]);

  return entry;
}

var walk_directory = function(directory)
{
  files = fs.readdirSync(directory)
  var i = 0;
  
  for (i = 0; i < files.length; i++)
  {
    var entry = create_file_entry(files[i], directory);
    file_object["files"].push(entry);
  }
}

walk_directory("hak");
walk_directory("erf");
walk_directory("tlk");
walk_directory("dmvault");

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