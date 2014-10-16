var Path = require('path');
var Hapi = require('hapi');
var server = new Hapi.Server('localhost', 3000);
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		var htmlFile = ['<html>','	<head>Test style stuff</head>','	<body>'];
		htmlFile.push('<table style="border-spacing: 0">','<tbody>','<tr>','<td class="gutten gl" style="text-align:right">');
		htmlFile.push('<pre class="lineno">','1','</pre>','<pre class="lineno">2</pre>');
		htmlFile.push('</td>','</tbody>','</table>');
		htmlFile.push('<p class="pos_fixed">Test</p>');
		htmlFile.push('<style>p.pos_fixed { position: fixed;background: red;}</style>',
					  '	</body>','</html>');
		reply(htmlFile.join('\n'));
}})

server.start(function () {
    console.log('Server running at:', server.info.uri);
});