module.exports = function (grunt) {


	//You need to execute this task, i.e. fakes:yourthing, and then faker!

	grunt.registerMultiTask('fakes', 'Build fakes with faker.. :P', function() {

		var path = require('path');

		//console.log('this', this)

		var options = this.options({
            dest: 'fakes/generated',
            seeds: 'fakes/seeds',
		})

		//console.log('Data', this.data)
		//console.log('---------------')

		function processElement(name, config) {

			switch(config.type) {

				case 'list':

					var n = config.n || 10;
					var seed = config.seed || name + '.json';

					grunt.log.writeln('- Processing', name, config.type, n, seed);

					//Generate the list
					var list = new Array(n);
					for (var i = 0; i < n; i++) list[i] = i
					grunt.file.write( path.join(options.dest, name + '.json'), JSON.stringify(list) )

					//Generate data of each element of the list, using the real faker.. :P
					list.forEach(function(id) {

						grunt.config.data.faker[name + '_' + id] = {
							options: {
								jsonFormat: path.join(options.seeds, seed),
								out: path.join(options.dest, name, id + '.json')
							}
						}
					})
					break;

				default:

					var seed = config.seed || name + '.json';
					grunt.log.writeln('- Processing', name, seed);
					grunt.config.data.faker[name] = {
						options: {
							jsonFormat: path.join(options.seeds, seed),
							out: path.join(options.dest, name + '.json')
						}
					}
					break;
			}
		}

		/* Dep: Create the faker obj in case its not, in the global grunt config */
		grunt.config.data.faker = grunt.config.data.faker || {}

		var data = this.data;
		Object.keys(data).forEach(function(name) {
			processElement(name, data[name])
		});


		//Example using faker from here:
		// grunt.config.data.faker = {
		// 	hola: {
		// 		options: {
		// 			jsonFormat: 'f.json',
		// 			out: 'asd.json'	
		// 		}
				
		// 	}
		// }
	})

}