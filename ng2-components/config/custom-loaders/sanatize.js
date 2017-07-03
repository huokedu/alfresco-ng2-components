var path = require('path');
var loaderUtils = require('loader-utils');
var fs = require('fs');

function isFileEmpty(fileContents) {
    return fileContents.toString('utf8').trim() === '';
}

function writeFile(file, newValue) {
    fs.writeFileSync(file, newValue, 'utf-8');
}

function readFile(file) {
    return fs.readFileSync(file, 'utf8');
}

function sanitizeTs(currentFileContent, webpackInstance) {
    if (!isFileEmpty(currentFileContent)) {

        var componentReg = /(@Component)(\s?)\((\s?){(\s?)((.|\n)*)}(\s?)\)/gm;
        var componentSection = componentReg.exec(currentFileContent);

        if (componentSection) {
            var selectorReg = /(selector)(\s?):(\s?)('|")((.|)*)('|")/gm;
            var selector = selectorReg.exec(componentSection[0]);


            if (selector) {

                if ((selector[0].indexOf('alfresco-') > 0 || selector[0].indexOf('activiti-') > 0) && selector[0].indexOf('adf-') === -1) {
                    var oldSelector = selector[0].replace("selector: '[", "").replace("']", '').replace("selector: '", "").replace("'", '');
                    var newSelector = oldSelector;
                    var newSelector = newSelector.replace("ng2-alfresco-", 'adf-').replace("alfresco-", 'adf-').replace("activiti-", "adf-");
                    var totalNewSelector = newSelector + ", " + oldSelector;

                    var newFileContent = currentFileContent.replace("'" + oldSelector, "'" + totalNewSelector);
                    newFileContent = newFileContent.replace("<" + oldSelector, "<" + newSelector);
                    newFileContent = newFileContent.replace("</" + oldSelector, "</" + newSelector);
                    writeFile(webpackInstance.resourcePath, newFileContent);

                    // console.log("\n ['" + oldSelector + '](' + webpackInstance.resourcePath.substr(0, webpackInstance.resourcePath.indexOf('src')) + 'README.md)' + "\n");
                }
                return {oldSelector: oldSelector, newSelector: newSelector, totalNewSelector: totalNewSelector};
            }
        }

    }
}

function sanitizeHtml(input, webpackInstance) {

    var htmlFile = webpackInstance.resourcePath.replace('.ts', '.html');
    var htmlContent = readFile(htmlFile);

    if (htmlContent) {
        htmlContent = htmlContent.replace(/<activiti/, "<adf");
        htmlContent = htmlContent.replace(/<alfresco/, "<adf");
        htmlContent = htmlContent.replace(/<\/activiti/, "</adf");
        htmlContent = htmlContent.replace(/<\/alfresco/, "</adf");

        writeFile(htmlFile, htmlContent);
    }
}

function sanitizeReadme(input, webpackInstance) {
    var readmeFile = webpackInstance.resourcePath.substr(0, webpackInstance.resourcePath.indexOf('src')) + 'README.md';
    var readmeFileContent = readFile(readmeFile);

    if (readmeFileContent) {
        readmeFileContent = readmeFileContent.replace(/(?:(<))(alfresco|activiti|ng2-alfresco)(?=-)([^- \n]*)/g, "<adf");
        readmeFileContent = readmeFileContent.replace(/(?:(<\/))(alfresco|activiti|ng2-alfresco)(?=-)([^- \n]*)/g, "</adf");
        writeFile(readmeFile, readmeFileContent);
    }

}

module.exports = function (input, map) {
    this.cacheable && this.cacheable();
    var callback = this.async();

    var selectorObj = sanitizeTs(input, this);

    if (selectorObj) {
        sanitizeHtml(input, this);
        sanitizeReadme(input, this);
    }

    callback(null, input, map);
};
