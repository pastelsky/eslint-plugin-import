'use strict';var _path = require('path');var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _isGlob = require('is-glob');var _isGlob2 = _interopRequireDefault(_isGlob);
var _minimatch = require('minimatch');
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _importType = require('../core/importType');var _importType2 = _interopRequireDefault(_importType);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var containsPath = function containsPath(filepath, target) {
  var relative = _path2['default'].relative(target, filepath);
  return relative === '' || !relative.startsWith('..');
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2['default'])('no-restricted-paths') },


    schema: [
    {
      type: 'object',
      properties: {
        zones: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              target: {
                oneOf: [
                { type: 'string' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true,
                  minLength: 1 }] },



              from: {
                oneOf: [
                { type: 'string' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true,
                  minLength: 1 }] },



              except: {
                type: 'array',
                items: {
                  type: 'string' },

                uniqueItems: true },

              message: { type: 'string' } },

            additionalProperties: false } },


        basePath: { type: 'string' } },

      additionalProperties: false }] },




  create: function () {function noRestrictedPaths(context) {
      var options = context.options[0] || {};
      var restrictedPaths = options.zones || [];
      var basePath = options.basePath || process.cwd();
      var currentFilename = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
      var matchingZones = restrictedPaths.filter(function (zone) {
        return [].concat(zone.target).
        map(function (target) {return _path2['default'].resolve(basePath, target);}).
        some(function (targetPath) {return isMatchingTargetPath(currentFilename, targetPath);});
      });

      function isMatchingTargetPath(filename, targetPath) {
        if ((0, _isGlob2['default'])(targetPath)) {
          var mm = new _minimatch.Minimatch(targetPath);
          return mm.match(filename);
        }

        return containsPath(filename, targetPath);
      }

      function isValidExceptionPath(absoluteFromPath, absoluteExceptionPath) {
        var relativeExceptionPath = _path2['default'].relative(absoluteFromPath, absoluteExceptionPath);

        return (0, _importType2['default'])(relativeExceptionPath, context) !== 'parent';
      }

      function areBothGlobPatternAndAbsolutePath(areGlobPatterns) {
        return areGlobPatterns.some(function (isGlob) {return isGlob;}) && areGlobPatterns.some(function (isGlob) {return !isGlob;});
      }

      function reportInvalidExceptionPath(node) {
        context.report({
          node: node,
          message: 'Restricted path exceptions must be descendants of the configured `from` path for that zone.' });

      }

      function reportInvalidExceptionMixedGlobAndNonGlob(node) {
        context.report({
          node: node,
          message: 'Restricted path `from` must contain either only glob patterns or none' });

      }

      function reportInvalidExceptionGlob(node) {
        context.report({
          node: node,
          message: 'Restricted path exceptions must be glob patterns when `from` contains glob patterns' });

      }

      function computeMixedGlobAndAbsolutePathValidator() {
        return {
          isPathRestricted: function () {function isPathRestricted() {return true;}return isPathRestricted;}(),
          hasValidExceptions: false,
          reportInvalidException: reportInvalidExceptionMixedGlobAndNonGlob };

      }

      function computeGlobPatternPathValidator(absoluteFrom, zoneExcept) {
        var isPathException = void 0;

        var mm = new _minimatch.Minimatch(absoluteFrom);
        var isPathRestricted = function () {function isPathRestricted(absoluteImportPath) {return mm.match(absoluteImportPath);}return isPathRestricted;}();
        var hasValidExceptions = zoneExcept.every(_isGlob2['default']);

        if (hasValidExceptions) {
          var exceptionsMm = zoneExcept.map(function (except) {return new _minimatch.Minimatch(except);});
          isPathException = function () {function isPathException(absoluteImportPath) {return exceptionsMm.some(function (mm) {return mm.match(absoluteImportPath);});}return isPathException;}();
        }

        var reportInvalidException = reportInvalidExceptionGlob;

        return {
          isPathRestricted: isPathRestricted,
          hasValidExceptions: hasValidExceptions,
          isPathException: isPathException,
          reportInvalidException: reportInvalidException };

      }

      function computeAbsolutePathValidator(absoluteFrom, zoneExcept) {
        var isPathException = void 0;

        var isPathRestricted = function () {function isPathRestricted(absoluteImportPath) {return containsPath(absoluteImportPath, absoluteFrom);}return isPathRestricted;}();

        var absoluteExceptionPaths = zoneExcept.
        map(function (exceptionPath) {return _path2['default'].resolve(absoluteFrom, exceptionPath);});
        var hasValidExceptions = absoluteExceptionPaths.
        every(function (absoluteExceptionPath) {return isValidExceptionPath(absoluteFrom, absoluteExceptionPath);});

        if (hasValidExceptions) {
          isPathException = function () {function isPathException(absoluteImportPath) {return absoluteExceptionPaths.some(
              function (absoluteExceptionPath) {return containsPath(absoluteImportPath, absoluteExceptionPath);});}return isPathException;}();

        }

        var reportInvalidException = reportInvalidExceptionPath;

        return {
          isPathRestricted: isPathRestricted,
          hasValidExceptions: hasValidExceptions,
          isPathException: isPathException,
          reportInvalidException: reportInvalidException };

      }

      function reportInvalidExceptions(validators, node) {
        validators.forEach(function (validator) {return validator.reportInvalidException(node);});
      }

      function reportImportsInRestrictedZone(validators, node, importPath, customMessage) {
        validators.forEach(function () {
          context.report({
            node: node,
            message: 'Unexpected path "{{importPath}}" imported in restricted zone.' + (customMessage ? ' ' + String(customMessage) : ''),
            data: { importPath: importPath } });

        });
      }

      var makePathValidators = function () {function makePathValidators(zoneFrom) {var zoneExcept = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
          var allZoneFrom = [].concat(zoneFrom);
          var areGlobPatterns = allZoneFrom.map(_isGlob2['default']);

          if (areBothGlobPatternAndAbsolutePath(areGlobPatterns)) {
            return [computeMixedGlobAndAbsolutePathValidator()];
          }

          var isGlobPattern = areGlobPatterns.every(function (isGlob) {return isGlob;});

          return allZoneFrom.map(function (singleZoneFrom) {
            var absoluteFrom = _path2['default'].resolve(basePath, singleZoneFrom);

            if (isGlobPattern) {
              return computeGlobPatternPathValidator(absoluteFrom, zoneExcept);
            }
            return computeAbsolutePathValidator(absoluteFrom, zoneExcept);
          });
        }return makePathValidators;}();

      var validators = [];

      function checkForRestrictedImportPath(importPath, node) {
        var absoluteImportPath = (0, _resolve2['default'])(importPath, context);

        if (!absoluteImportPath) {
          return;
        }

        matchingZones.forEach(function (zone, index) {
          if (!validators[index]) {
            validators[index] = makePathValidators(zone.from, zone.except);
          }

          var applicableValidatorsForImportPath = validators[index].filter(function (validator) {return validator.isPathRestricted(absoluteImportPath);});

          var validatorsWithInvalidExceptions = applicableValidatorsForImportPath.filter(function (validator) {return !validator.hasValidExceptions;});
          reportInvalidExceptions(validatorsWithInvalidExceptions, node);

          var applicableValidatorsForImportPathExcludingExceptions = applicableValidatorsForImportPath.
          filter(function (validator) {return validator.hasValidExceptions;}).
          filter(function (validator) {return !validator.isPathException(absoluteImportPath);});
          reportImportsInRestrictedZone(applicableValidatorsForImportPathExcludingExceptions, node, importPath, zone.message);
        });
      }

      return (0, _moduleVisitor2['default'])(function (source) {
        checkForRestrictedImportPath(source.value, source);
      }, { commonjs: true });
    }return noRestrictedPaths;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1yZXN0cmljdGVkLXBhdGhzLmpzIl0sIm5hbWVzIjpbImNvbnRhaW5zUGF0aCIsImZpbGVwYXRoIiwidGFyZ2V0IiwicmVsYXRpdmUiLCJwYXRoIiwic3RhcnRzV2l0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiem9uZXMiLCJtaW5JdGVtcyIsIml0ZW1zIiwib25lT2YiLCJ1bmlxdWVJdGVtcyIsIm1pbkxlbmd0aCIsImZyb20iLCJleGNlcHQiLCJtZXNzYWdlIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJiYXNlUGF0aCIsImNyZWF0ZSIsIm5vUmVzdHJpY3RlZFBhdGhzIiwiY29udGV4dCIsIm9wdGlvbnMiLCJyZXN0cmljdGVkUGF0aHMiLCJwcm9jZXNzIiwiY3dkIiwiY3VycmVudEZpbGVuYW1lIiwiZ2V0UGh5c2ljYWxGaWxlbmFtZSIsImdldEZpbGVuYW1lIiwibWF0Y2hpbmdab25lcyIsImZpbHRlciIsInpvbmUiLCJjb25jYXQiLCJtYXAiLCJyZXNvbHZlIiwic29tZSIsImlzTWF0Y2hpbmdUYXJnZXRQYXRoIiwidGFyZ2V0UGF0aCIsImZpbGVuYW1lIiwibW0iLCJNaW5pbWF0Y2giLCJtYXRjaCIsImlzVmFsaWRFeGNlcHRpb25QYXRoIiwiYWJzb2x1dGVGcm9tUGF0aCIsImFic29sdXRlRXhjZXB0aW9uUGF0aCIsInJlbGF0aXZlRXhjZXB0aW9uUGF0aCIsImFyZUJvdGhHbG9iUGF0dGVybkFuZEFic29sdXRlUGF0aCIsImFyZUdsb2JQYXR0ZXJucyIsImlzR2xvYiIsInJlcG9ydEludmFsaWRFeGNlcHRpb25QYXRoIiwibm9kZSIsInJlcG9ydCIsInJlcG9ydEludmFsaWRFeGNlcHRpb25NaXhlZEdsb2JBbmROb25HbG9iIiwicmVwb3J0SW52YWxpZEV4Y2VwdGlvbkdsb2IiLCJjb21wdXRlTWl4ZWRHbG9iQW5kQWJzb2x1dGVQYXRoVmFsaWRhdG9yIiwiaXNQYXRoUmVzdHJpY3RlZCIsImhhc1ZhbGlkRXhjZXB0aW9ucyIsInJlcG9ydEludmFsaWRFeGNlcHRpb24iLCJjb21wdXRlR2xvYlBhdHRlcm5QYXRoVmFsaWRhdG9yIiwiYWJzb2x1dGVGcm9tIiwiem9uZUV4Y2VwdCIsImlzUGF0aEV4Y2VwdGlvbiIsImFic29sdXRlSW1wb3J0UGF0aCIsImV2ZXJ5IiwiZXhjZXB0aW9uc01tIiwiY29tcHV0ZUFic29sdXRlUGF0aFZhbGlkYXRvciIsImFic29sdXRlRXhjZXB0aW9uUGF0aHMiLCJleGNlcHRpb25QYXRoIiwicmVwb3J0SW52YWxpZEV4Y2VwdGlvbnMiLCJ2YWxpZGF0b3JzIiwiZm9yRWFjaCIsInZhbGlkYXRvciIsInJlcG9ydEltcG9ydHNJblJlc3RyaWN0ZWRab25lIiwiaW1wb3J0UGF0aCIsImN1c3RvbU1lc3NhZ2UiLCJkYXRhIiwibWFrZVBhdGhWYWxpZGF0b3JzIiwiem9uZUZyb20iLCJhbGxab25lRnJvbSIsImlzR2xvYlBhdHRlcm4iLCJzaW5nbGVab25lRnJvbSIsImNoZWNrRm9yUmVzdHJpY3RlZEltcG9ydFBhdGgiLCJpbmRleCIsImFwcGxpY2FibGVWYWxpZGF0b3JzRm9ySW1wb3J0UGF0aCIsInZhbGlkYXRvcnNXaXRoSW52YWxpZEV4Y2VwdGlvbnMiLCJhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGhFeGNsdWRpbmdFeGNlcHRpb25zIiwic291cmNlIiwidmFsdWUiLCJjb21tb25qcyJdLCJtYXBwaW5ncyI6ImFBQUEsNEI7O0FBRUEsc0Q7QUFDQSxrRTtBQUNBLGlDO0FBQ0E7QUFDQSxxQztBQUNBLGdEOztBQUVBLElBQU1BLGVBQWUsU0FBZkEsWUFBZSxDQUFDQyxRQUFELEVBQVdDLE1BQVgsRUFBc0I7QUFDekMsTUFBTUMsV0FBV0Msa0JBQUtELFFBQUwsQ0FBY0QsTUFBZCxFQUFzQkQsUUFBdEIsQ0FBakI7QUFDQSxTQUFPRSxhQUFhLEVBQWIsSUFBbUIsQ0FBQ0EsU0FBU0Us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T0FGTSxFQUVKLEVBQUVFLFVBQVUsSUFBWixFQUZJLENBQVA7QUFHRCxLQTFLRCxPQUFpQnBFLGlCQUFqQixJQTFEZSxFQUFqQiIsImZpbGUiOiJuby1yZXN0cmljdGVkLXBhdGhzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSc7XG5pbXBvcnQgbW9kdWxlVmlzaXRvciBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL21vZHVsZVZpc2l0b3InO1xuaW1wb3J0IGlzR2xvYiBmcm9tICdpcy1nbG9iJztcbmltcG9ydCB7IE1pbmltYXRjaCB9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSc7XG5cbmNvbnN0IGNvbnRhaW5zUGF0aCA9IChmaWxlcGF0aCwgdGFyZ2V0KSA9PiB7XG4gIGNvbnN0IHJlbGF0aXZlID0gcGF0aC5yZWxhdGl2ZSh0YXJnZXQsIGZpbGVwYXRoKTtcbiAgcmV0dXJuIHJlbGF0aXZlID09PSAnJyB8fCAhcmVsYXRpdmUuc3RhcnRzV2l0aCgnLi4nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGRvY3M6IHtcbiAgICAgIHVybDogZG9jc1VybCgnbm8tcmVzdHJpY3RlZC1wYXRocycpLFxuICAgIH0sXG5cbiAgICBzY2hlbWE6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICB6b25lczoge1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgIG1pbkl0ZW1zOiAxLFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICAgIG9uZU9mOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVJdGVtczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnJvbToge1xuICAgICAgICAgICAgICAgICAgb25lT2Y6IFtcbiAgICAgICAgICAgICAgICAgICAgeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUl0ZW1zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBleGNlcHQ6IHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB1bmlxdWVJdGVtczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJhc2VQYXRoOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBjcmVhdGU6IGZ1bmN0aW9uIG5vUmVzdHJpY3RlZFBhdGhzKGNvbnRleHQpIHtcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xuICAgIGNvbnN0IHJlc3RyaWN0ZWRQYXRocyA9IG9wdGlvbnMuem9uZXMgfHwgW107XG4gICAgY29uc3QgYmFzZVBhdGggPSBvcHRpb25zLmJhc2VQYXRoIHx8IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgY3VycmVudEZpbGVuYW1lID0gY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lID8gY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lKCkgOiBjb250ZXh0LmdldEZpbGVuYW1lKCk7XG4gICAgY29uc3QgbWF0Y2hpbmdab25lcyA9IHJlc3RyaWN0ZWRQYXRocy5maWx0ZXIoKHpvbmUpID0+IHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoem9uZS50YXJnZXQpXG4gICAgICAgIC5tYXAodGFyZ2V0ID0+IHBhdGgucmVzb2x2ZShiYXNlUGF0aCwgdGFyZ2V0KSlcbiAgICAgICAgLnNvbWUodGFyZ2V0UGF0aCA9PiBpc01hdGNoaW5nVGFyZ2V0UGF0aChjdXJyZW50RmlsZW5hbWUsIHRhcmdldFBhdGgpKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGlzTWF0Y2hpbmdUYXJnZXRQYXRoKGZpbGVuYW1lLCB0YXJnZXRQYXRoKSB7XG4gICAgICBpZiAoaXNHbG9iKHRhcmdldFBhdGgpKSB7XG4gICAgICAgIGNvbnN0IG1tID0gbmV3IE1pbmltYXRjaCh0YXJnZXRQYXRoKTtcbiAgICAgICAgcmV0dXJuIG1tLm1hdGNoKGZpbGVuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRhaW5zUGF0aChmaWxlbmFtZSwgdGFyZ2V0UGF0aCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNWYWxpZEV4Y2VwdGlvblBhdGgoYWJzb2x1dGVGcm9tUGF0aCwgYWJzb2x1dGVFeGNlcHRpb25QYXRoKSB7XG4gICAgICBjb25zdCByZWxhdGl2ZUV4Y2VwdGlvblBhdGggPSBwYXRoLnJlbGF0aXZlKGFic29sdXRlRnJvbVBhdGgsIGFic29sdXRlRXhjZXB0aW9uUGF0aCk7XG5cbiAgICAgIHJldHVybiBpbXBvcnRUeXBlKHJlbGF0aXZlRXhjZXB0aW9uUGF0aCwgY29udGV4dCkgIT09ICdwYXJlbnQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFyZUJvdGhHbG9iUGF0dGVybkFuZEFic29sdXRlUGF0aChhcmVHbG9iUGF0dGVybnMpIHtcbiAgICAgIHJldHVybiBhcmVHbG9iUGF0dGVybnMuc29tZSgoaXNHbG9iKSA9PiBpc0dsb2IpICYmIGFyZUdsb2JQYXR0ZXJucy5zb21lKChpc0dsb2IpID0+ICFpc0dsb2IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlcG9ydEludmFsaWRFeGNlcHRpb25QYXRoKG5vZGUpIHtcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgbm9kZSxcbiAgICAgICAgbWVzc2FnZTogJ1Jlc3RyaWN0ZWQgcGF0aCBleGNlcHRpb25zIG11c3QgYmUgZGVzY2VuZGFudHMgb2YgdGhlIGNvbmZpZ3VyZWQgYGZyb21gIHBhdGggZm9yIHRoYXQgem9uZS4nLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVwb3J0SW52YWxpZEV4Y2VwdGlvbk1peGVkR2xvYkFuZE5vbkdsb2Iobm9kZSkge1xuICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICBub2RlLFxuICAgICAgICBtZXNzYWdlOiAnUmVzdHJpY3RlZCBwYXRoIGBmcm9tYCBtdXN0IGNvbnRhaW4gZWl0aGVyIG9ubHkgZ2xvYiBwYXR0ZXJucyBvciBub25lJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlcG9ydEludmFsaWRFeGNlcHRpb25HbG9iKG5vZGUpIHtcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgbm9kZSxcbiAgICAgICAgbWVzc2FnZTogJ1Jlc3RyaWN0ZWQgcGF0aCBleGNlcHRpb25zIG11c3QgYmUgZ2xvYiBwYXR0ZXJucyB3aGVuIGBmcm9tYCBjb250YWlucyBnbG9iIHBhdHRlcm5zJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXB1dGVNaXhlZEdsb2JBbmRBYnNvbHV0ZVBhdGhWYWxpZGF0b3IoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1BhdGhSZXN0cmljdGVkOiAoKSA9PiB0cnVlLFxuICAgICAgICBoYXNWYWxpZEV4Y2VwdGlvbnM6IGZhbHNlLFxuICAgICAgICByZXBvcnRJbnZhbGlkRXhjZXB0aW9uOiByZXBvcnRJbnZhbGlkRXhjZXB0aW9uTWl4ZWRHbG9iQW5kTm9uR2xvYixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZUdsb2JQYXR0ZXJuUGF0aFZhbGlkYXRvcihhYnNvbHV0ZUZyb20sIHpvbmVFeGNlcHQpIHtcbiAgICAgIGxldCBpc1BhdGhFeGNlcHRpb247XG5cbiAgICAgIGNvbnN0IG1tID0gbmV3IE1pbmltYXRjaChhYnNvbHV0ZUZyb20pO1xuICAgICAgY29uc3QgaXNQYXRoUmVzdHJpY3RlZCA9IChhYnNvbHV0ZUltcG9ydFBhdGgpID0+IG1tLm1hdGNoKGFic29sdXRlSW1wb3J0UGF0aCk7XG4gICAgICBjb25zdCBoYXNWYWxpZEV4Y2VwdGlvbnMgPSB6b25lRXhjZXB0LmV2ZXJ5KGlzR2xvYik7XG5cbiAgICAgIGlmIChoYXNWYWxpZEV4Y2VwdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZXhjZXB0aW9uc01tID0gem9uZUV4Y2VwdC5tYXAoKGV4Y2VwdCkgPT4gbmV3IE1pbmltYXRjaChleGNlcHQpKTtcbiAgICAgICAgaXNQYXRoRXhjZXB0aW9uID0gKGFic29sdXRlSW1wb3J0UGF0aCkgPT4gZXhjZXB0aW9uc01tLnNvbWUoKG1tKSA9PiBtbS5tYXRjaChhYnNvbHV0ZUltcG9ydFBhdGgpKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVwb3J0SW52YWxpZEV4Y2VwdGlvbiA9IHJlcG9ydEludmFsaWRFeGNlcHRpb25HbG9iO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1BhdGhSZXN0cmljdGVkLFxuICAgICAgICBoYXNWYWxpZEV4Y2VwdGlvbnMsXG4gICAgICAgIGlzUGF0aEV4Y2VwdGlvbixcbiAgICAgICAgcmVwb3J0SW52YWxpZEV4Y2VwdGlvbixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZUFic29sdXRlUGF0aFZhbGlkYXRvcihhYnNvbHV0ZUZyb20sIHpvbmVFeGNlcHQpIHtcbiAgICAgIGxldCBpc1BhdGhFeGNlcHRpb247XG5cbiAgICAgIGNvbnN0IGlzUGF0aFJlc3RyaWN0ZWQgPSAoYWJzb2x1dGVJbXBvcnRQYXRoKSA9PiBjb250YWluc1BhdGgoYWJzb2x1dGVJbXBvcnRQYXRoLCBhYnNvbHV0ZUZyb20pO1xuXG4gICAgICBjb25zdCBhYnNvbHV0ZUV4Y2VwdGlvblBhdGhzID0gem9uZUV4Y2VwdFxuICAgICAgICAubWFwKChleGNlcHRpb25QYXRoKSA9PiBwYXRoLnJlc29sdmUoYWJzb2x1dGVGcm9tLCBleGNlcHRpb25QYXRoKSk7XG4gICAgICBjb25zdCBoYXNWYWxpZEV4Y2VwdGlvbnMgPSBhYnNvbHV0ZUV4Y2VwdGlvblBhdGhzXG4gICAgICAgIC5ldmVyeSgoYWJzb2x1dGVFeGNlcHRpb25QYXRoKSA9PiBpc1ZhbGlkRXhjZXB0aW9uUGF0aChhYnNvbHV0ZUZyb20sIGFic29sdXRlRXhjZXB0aW9uUGF0aCkpO1xuXG4gICAgICBpZiAoaGFzVmFsaWRFeGNlcHRpb25zKSB7XG4gICAgICAgIGlzUGF0aEV4Y2VwdGlvbiA9IChhYnNvbHV0ZUltcG9ydFBhdGgpID0+IGFic29sdXRlRXhjZXB0aW9uUGF0aHMuc29tZShcbiAgICAgICAgICAoYWJzb2x1dGVFeGNlcHRpb25QYXRoKSA9PiBjb250YWluc1BhdGgoYWJzb2x1dGVJbXBvcnRQYXRoLCBhYnNvbHV0ZUV4Y2VwdGlvblBhdGgpLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXBvcnRJbnZhbGlkRXhjZXB0aW9uID0gcmVwb3J0SW52YWxpZEV4Y2VwdGlvblBhdGg7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzUGF0aFJlc3RyaWN0ZWQsXG4gICAgICAgIGhhc1ZhbGlkRXhjZXB0aW9ucyxcbiAgICAgICAgaXNQYXRoRXhjZXB0aW9uLFxuICAgICAgICByZXBvcnRJbnZhbGlkRXhjZXB0aW9uLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXBvcnRJbnZhbGlkRXhjZXB0aW9ucyh2YWxpZGF0b3JzLCBub2RlKSB7XG4gICAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRvci5yZXBvcnRJbnZhbGlkRXhjZXB0aW9uKG5vZGUpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXBvcnRJbXBvcnRzSW5SZXN0cmljdGVkWm9uZSh2YWxpZGF0b3JzLCBub2RlLCBpbXBvcnRQYXRoLCBjdXN0b21NZXNzYWdlKSB7XG4gICAgICB2YWxpZGF0b3JzLmZvckVhY2goKCkgPT4ge1xuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCBwYXRoIFwie3tpbXBvcnRQYXRofX1cIiBpbXBvcnRlZCBpbiByZXN0cmljdGVkIHpvbmUuJHtjdXN0b21NZXNzYWdlID8gYCAke2N1c3RvbU1lc3NhZ2V9YCA6ICcnfWAsXG4gICAgICAgICAgZGF0YTogeyBpbXBvcnRQYXRoIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWFrZVBhdGhWYWxpZGF0b3JzID0gKHpvbmVGcm9tLCB6b25lRXhjZXB0ID0gW10pID0+IHtcbiAgICAgIGNvbnN0IGFsbFpvbmVGcm9tID0gW10uY29uY2F0KHpvbmVGcm9tKTtcbiAgICAgIGNvbnN0IGFyZUdsb2JQYXR0ZXJucyA9IGFsbFpvbmVGcm9tLm1hcChpc0dsb2IpO1xuXG4gICAgICBpZiAoYXJlQm90aEdsb2JQYXR0ZXJuQW5kQWJzb2x1dGVQYXRoKGFyZUdsb2JQYXR0ZXJucykpIHtcbiAgICAgICAgcmV0dXJuIFtjb21wdXRlTWl4ZWRHbG9iQW5kQWJzb2x1dGVQYXRoVmFsaWRhdG9yKCldO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0dsb2JQYXR0ZXJuID0gYXJlR2xvYlBhdHRlcm5zLmV2ZXJ5KChpc0dsb2IpID0+IGlzR2xvYik7XG5cbiAgICAgIHJldHVybiBhbGxab25lRnJvbS5tYXAoc2luZ2xlWm9uZUZyb20gPT4ge1xuICAgICAgICBjb25zdCBhYnNvbHV0ZUZyb20gPSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIHNpbmdsZVpvbmVGcm9tKTtcblxuICAgICAgICBpZiAoaXNHbG9iUGF0dGVybikge1xuICAgICAgICAgIHJldHVybiBjb21wdXRlR2xvYlBhdHRlcm5QYXRoVmFsaWRhdG9yKGFic29sdXRlRnJvbSwgem9uZUV4Y2VwdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXB1dGVBYnNvbHV0ZVBhdGhWYWxpZGF0b3IoYWJzb2x1dGVGcm9tLCB6b25lRXhjZXB0KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCB2YWxpZGF0b3JzID0gW107XG5cbiAgICBmdW5jdGlvbiBjaGVja0ZvclJlc3RyaWN0ZWRJbXBvcnRQYXRoKGltcG9ydFBhdGgsIG5vZGUpIHtcbiAgICAgIGNvbnN0IGFic29sdXRlSW1wb3J0UGF0aCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dCk7XG5cbiAgICAgIGlmICghYWJzb2x1dGVJbXBvcnRQYXRoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbWF0Y2hpbmdab25lcy5mb3JFYWNoKCh6b25lLCBpbmRleCkgPT4ge1xuICAgICAgICBpZiAoIXZhbGlkYXRvcnNbaW5kZXhdKSB7XG4gICAgICAgICAgdmFsaWRhdG9yc1tpbmRleF0gPSBtYWtlUGF0aFZhbGlkYXRvcnMoem9uZS5mcm9tLCB6b25lLmV4Y2VwdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGggPSB2YWxpZGF0b3JzW2luZGV4XS5maWx0ZXIodmFsaWRhdG9yID0+IHZhbGlkYXRvci5pc1BhdGhSZXN0cmljdGVkKGFic29sdXRlSW1wb3J0UGF0aCkpO1xuXG4gICAgICAgIGNvbnN0IHZhbGlkYXRvcnNXaXRoSW52YWxpZEV4Y2VwdGlvbnMgPSBhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGguZmlsdGVyKHZhbGlkYXRvciA9PiAhdmFsaWRhdG9yLmhhc1ZhbGlkRXhjZXB0aW9ucyk7XG4gICAgICAgIHJlcG9ydEludmFsaWRFeGNlcHRpb25zKHZhbGlkYXRvcnNXaXRoSW52YWxpZEV4Y2VwdGlvbnMsIG5vZGUpO1xuXG4gICAgICAgIGNvbnN0IGFwcGxpY2FibGVWYWxpZGF0b3JzRm9ySW1wb3J0UGF0aEV4Y2x1ZGluZ0V4Y2VwdGlvbnMgPSBhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGhcbiAgICAgICAgICAuZmlsdGVyKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IuaGFzVmFsaWRFeGNlcHRpb25zKVxuICAgICAgICAgIC5maWx0ZXIodmFsaWRhdG9yID0+ICF2YWxpZGF0b3IuaXNQYXRoRXhjZXB0aW9uKGFic29sdXRlSW1wb3J0UGF0aCkpO1xuICAgICAgICByZXBvcnRJbXBvcnRzSW5SZXN0cmljdGVkWm9uZShhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGhFeGNsdWRpbmdFeGNlcHRpb25zLCBub2RlLCBpbXBvcnRQYXRoLCB6b25lLm1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoKHNvdXJjZSkgPT4ge1xuICAgICAgY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChzb3VyY2UudmFsdWUsIHNvdXJjZSk7XG4gICAgfSwgeyBjb21tb25qczogdHJ1ZSB9KTtcbiAgfSxcbn07XG4iXX0=