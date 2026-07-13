var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var src = __dirname;
var dist = path.join(src, 'dist');
var excludes = ['.git', 'node_modules', 'dist', '.wranglerignore', '.gitignore', 'deploy.js', 'package.json'];

function copyRecursiveSync(source, target) {
    var stat = fs.statSync(source);
    if (stat.isDirectory()) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        var files = fs.readdirSync(source);
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (excludes.indexOf(file) !== -1) continue;
            copyRecursiveSync(path.join(source, file), path.join(target, file));
        }
    } else {
        fs.copyFileSync(source, target);
    }
}

if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
}
copyRecursiveSync(src, dist);

var wranglerJsonc = path.join(dist, 'wrangler.jsonc');
var config = JSON.parse(fs.readFileSync(wranglerJsonc, 'utf8'));
config.assets.directory = '.';
fs.writeFileSync(wranglerJsonc, JSON.stringify(config, null, 2));

child_process.execSync('npx wrangler deploy', { cwd: dist, stdio: 'inherit' });
