var path = require('path')
var loaderUtils = require('loader-utils')
var HtmlbarsCompiler = require('ember-cli-htmlbars')

var DEFAULT_TEMPLATE_COMPILER = 'components-ember/ember-template-compiler.js'
var templateTree
var appPath

/*
 * options:
 *  - appPath: default assuming webpack.config.js in root folder + ./app
 *  - templateCompiler: default 'components-ember/ember-template-compiler.js'
 */
module.exports = function(source) {
  this.cacheable && this.cacheable()
  var options = loaderUtils.parseQuery(this.query);
  var templatesFolder = (options.appPath || 'app').replace(/\/$/, '')

  templateTree = templateTree || new HtmlbarsCompiler(templatesFolder, {
    isHTMLBars: true,
    templateCompiler: require(options.templateCompiler || DEFAULT_TEMPLATE_COMPILER)
  });

  var resourcePathMatcher = new RegExp(templatesFolder + '/(.*)\.hbs$')
  var templateMatch = this.resourcePath.match(resourcePathMatcher)
  var templatePath = templateMatch.pop()

  var shouldExposeTemplate = options.shouldExposeTemplate !== undefined ? shouldExposeTemplate : true;

  var fullTemplate = templateTree.processString(source, templatePath)

  if (shouldExposeTemplate) {
    var templateString = fullTemplate.replace(/^export default Ember\./, 'Ember.')
    return 'Ember.TEMPLATES["' + templatePath + '"] = ' + templateString
  }

  return fullTemplate;
}
