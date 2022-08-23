'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @fileOverview Ensures that no imported module imports the linted module.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @author Ben Mosher
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _importType = require('../core/importType');
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}

var traversed = new Set();

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { url: (0, _docsUrl2['default'])('no-cycle') },
    schema: [(0, _moduleVisitor.makeOptionsSchema)({
      maxDepth: {
        oneOf: [
        {
          description: 'maximum dependency depth to traverse',
          type: 'integer',
          minimum: 1 },

        {
          'enum': ['∞'],
          type: 'string' }] },



      ignoreExternal: {
        description: 'ignore external modules',
        type: 'boolean',
        'default': false },

      allowUnsafeDynamicCyclicDependency: {
        description: 'Allow cyclic dependency if there is at least one dynamic import in the chain',
        type: 'boolean',
        'default': false } })] },




  create: function () {function create(context) {
      var myPath = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
      if (myPath === '<text>') return {}; // can't cycle-check a non-file

      var options = context.options[0] || {};
      var maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : Infinity;
      var ignoreModule = function () {function ignoreModule(name) {return options.ignoreExternal && (0, _importType.isExternalModule)(
          name,
          (0, _resolve2['default'])(name, context),
          context);}return ignoreModule;}();


      function checkSourceValue(sourceNode, importer) {
        if (ignoreModule(sourceNode.value)) {
          return; // ignore external modules
        }
        if (options.allowUnsafeDynamicCyclicDependency && (
        // Ignore `import()`
        importer.type === 'ImportExpression' ||
        // `require()` calls are always checked (if possible)
        importer.type === 'CallExpression' && importer.callee.name !== 'require')) {
          return; // cycle via dynamic import allowed by config
        }

        if (
        importer.type === 'ImportDeclaration' && (
        // import type { Foo } (TS and Flow)
        importer.importKind === 'type' ||
        // import { type Foo } (Flow)
        importer.specifiers.every(function (_ref) {var importKind = _ref.importKind;return importKind === 'type';})))

        {
          return; // ignore type imports
        }

        var imported = _ExportMap2['default'].get(sourceNode.value, context);

        if (imported == null) {
          return; // no-unresolved territory
        }

        if (imported.path === myPath) {
          return; // no-self-import territory
        }

        var untraversed = [{ mget: function () {function mget() {return imported;}return mget;}(), route: [] }];
        function detectCycle(_ref2) {var mget = _ref2.mget,route = _ref2.route;
          var m = mget();
          if (m == null) return;
          if (traversed.has(m.path)) return;
          traversed.add(m.path);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

            for (var _iterator = m.imports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var _ref3 = _step.value;var _ref4 = _slicedToArray(_ref3, 2);var path = _ref4[0];var _ref4$ = _ref4[1];var getter = _ref4$.getter;var declarations = _ref4$.declarations;
              if (traversed.has(path)) continue;
              var toTraverse = [].concat(_toConsumableArray(declarations)).filter(function (_ref5) {var source = _ref5.source,isOnlyImportingTypes = _ref5.isOnlyImportingTypes;return (
                  !ignoreModule(source.value) &&
                  // Ignore only type imports
                  !isOnlyImportingTypes);});


              /*
                                             If cyclic dependency is allowed via dynamic import, skip checking if any module is imported dynamically
                                             */
              if (options.allowUnsafeDynamicCyclicDependency && toTraverse.some(function (d) {return d.dynamic;})) return;

              /*
                                                                                                                           Only report as a cycle if there are any import declarations that are considered by
                                                                                                                           the rule. For example:
                                                                                                                            a.ts:
                                                                                                                           import { foo } from './b' // should not be reported as a cycle
                                                                                                                            b.ts:
                                                                                                                           import type { Bar } from './a'
                                                                                                                           */


              if (path === myPath && toTraverse.length > 0) return true;
              if (route.length + 1 < maxDepth) {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
                  for (var _iterator2 = toTraverse[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _ref6 = _step2.value;var source = _ref6.source;
                    untraversed.push({ mget: getter, route: route.concat(source) });
                  }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
              }
            }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
        }

        while (untraversed.length > 0) {
          var next = untraversed.shift(); // bfs!
          if (detectCycle(next)) {
            var message = next.route.length > 0 ? 'Dependency cycle via ' + String(
            routeString(next.route)) :
            'Dependency cycle detected.';
            context.report(importer, message);
            return;
          }
        }
      }

      return Object.assign((0, _moduleVisitor2['default'])(checkSourceValue, context.options[0]), {
        'Program:exit': function () {function ProgramExit() {
            traversed.clear();
          }return ProgramExit;}() });

    }return create;}() };


function routeString(route) {
  return route.map(function (s) {return String(s.value) + ':' + String(s.loc.start.line);}).join('=>');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1jeWNsZS5qcyJdLCJuYW1lcyI6WyJ0cmF2ZXJzZWQiLCJTZXQiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwic2NoZW1hIiwibWF4RGVwdGgiLCJvbmVPZiIsImRlc2NyaXB0aW9uIiwibWluaW11bSIsImlnbm9yZUV4dGVybmFsIiwiYWxsb3dVbnNhZmVEeW5hbWljQ3ljbGljRGVwZW5kZW5jeSIsImNyZWF0ZSIsImNvbnRleHQiLCJteVBhdGgiLCJnZXRQaHlzaWNhbEZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJvcHRpb25zIiwiSW5maW5pdHkiLCJpZ25vcmVNb2R1bGUiLCJuYW1lIiwiY2hlY2tTb3VyY2VWYWx1ZSIsInNvdXJjZU5vZGUiLCJpbXBvcnRlciIsInZhbHVlIiwiY2FsbGVlIiwiaW1wb3J0S2luZCIsInNwZWNpZmllcnMiLCJldmVyeSIsImltcG9ydGVkIiwiRXhwb3J0cyIsImdldCIsInBhdGgiLCJ1bnRyYXZlcnNlZCIsIm1nZXQiLCJyb3V0ZSIsImRldGVjdEN5Y2xlIiwibSIsImhhcyIsImFkZCIsImltcG9ydHMiLCJnZXR0ZXIiLCJkZWNsYXJhdGlvbnMiLCJ0b1RyYXZlcnNlIiwiZmlsdGVyIiwic291cmNlIiwiaXNPbmx5SW1wb3J0aW5nVHlwZXMiLCJzb21lIiwiZCIsImR5bmFtaWMiLCJsZW5ndGgiLCJwdXNoIiwiY29uY2F0IiwibmV4dCIsInNoaWZ0IiwibWVzc2FnZSIsInJvdXRlU3RyaW5nIiwicmVwb3J0IiwiT2JqZWN0IiwiYXNzaWduIiwiY2xlYXIiLCJtYXAiLCJzIiwibG9jIiwic3RhcnQiLCJsaW5lIiwiam9pbiJdLCJtYXBwaW5ncyI6InNvQkFBQTs7Ozs7QUFLQSxzRDtBQUNBLHlDO0FBQ0E7QUFDQSxrRTtBQUNBLHFDOztBQUVBLElBQU1BLFlBQVksSUFBSUMsR0FBSixFQUFsQjs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxR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RSxVQUFXRixLQUFLbEIsS0FBTCxDQUFXZSxNQUFYLEdBQW9CLENBQXBCO0FBQ1dNLHdCQUFZSCxLQUFLbEIsS0FBakIsQ0FEWDtBQUViLHdDQUZKO0FBR0F0QixvQkFBUTRDLE1BQVIsQ0FBZWxDLFFBQWYsRUFBeUJnQyxPQUF6QjtBQUNBO0FBQ0Q7QUFDRjtBQUNGOztBQUVELGFBQU9HLE9BQU9DLE1BQVAsQ0FBYyxnQ0FBY3RDLGdCQUFkLEVBQWdDUixRQUFRSSxPQUFSLENBQWdCLENBQWhCLENBQWhDLENBQWQsRUFBbUU7QUFDeEUscUNBQWdCLHVCQUFNO0FBQ3BCcEIsc0JBQVUrRCxLQUFWO0FBQ0QsV0FGRCxzQkFEd0UsRUFBbkUsQ0FBUDs7QUFLRCxLQXBJYyxtQkFBakI7OztBQXVJQSxTQUFTSixXQUFULENBQXFCckIsS0FBckIsRUFBNEI7QUFDMUIsU0FBT0EsTUFBTTBCLEdBQU4sQ0FBVSw0QkFBUUMsRUFBRXRDLEtBQVYsaUJBQW1Cc0MsRUFBRUMsR0FBRixDQUFNQyxLQUFOLENBQVlDLElBQS9CLEdBQVYsRUFBaURDLElBQWpELENBQXNELElBQXRELENBQVA7QUFDRCIsImZpbGUiOiJuby1jeWNsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVPdmVydmlldyBFbnN1cmVzIHRoYXQgbm8gaW1wb3J0ZWQgbW9kdWxlIGltcG9ydHMgdGhlIGxpbnRlZCBtb2R1bGUuXG4gKiBAYXV0aG9yIEJlbiBNb3NoZXJcbiAqL1xuXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnO1xuaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJztcbmltcG9ydCB7IGlzRXh0ZXJuYWxNb2R1bGUgfSBmcm9tICcuLi9jb3JlL2ltcG9ydFR5cGUnO1xuaW1wb3J0IG1vZHVsZVZpc2l0b3IsIHsgbWFrZU9wdGlvbnNTY2hlbWEgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL21vZHVsZVZpc2l0b3InO1xuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5cbmNvbnN0IHRyYXZlcnNlZCA9IG5ldyBTZXQoKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXG4gICAgZG9jczogeyB1cmw6IGRvY3NVcmwoJ25vLWN5Y2xlJykgfSxcbiAgICBzY2hlbWE6IFttYWtlT3B0aW9uc1NjaGVtYSh7XG4gICAgICBtYXhEZXB0aDoge1xuICAgICAgICBvbmVPZjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbWF4aW11bSBkZXBlbmRlbmN5IGRlcHRoIHRvIHRyYXZlcnNlJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgIG1pbmltdW06IDEsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBlbnVtOiBbJ+KIniddLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBpZ25vcmVFeHRlcm5hbDoge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ2lnbm9yZSBleHRlcm5hbCBtb2R1bGVzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBhbGxvd1Vuc2FmZUR5bmFtaWNDeWNsaWNEZXBlbmRlbmN5OiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQWxsb3cgY3ljbGljIGRlcGVuZGVuY3kgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGR5bmFtaWMgaW1wb3J0IGluIHRoZSBjaGFpbicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIGNvbnN0IG15UGF0aCA9IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSA/IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSgpIDogY29udGV4dC5nZXRGaWxlbmFtZSgpO1xuICAgIGlmIChteVBhdGggPT09ICc8dGV4dD4nKSByZXR1cm4ge307IC8vIGNhbid0IGN5Y2xlLWNoZWNrIGEgbm9uLWZpbGVcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XG4gICAgY29uc3QgbWF4RGVwdGggPSB0eXBlb2Ygb3B0aW9ucy5tYXhEZXB0aCA9PT0gJ251bWJlcicgPyBvcHRpb25zLm1heERlcHRoIDogSW5maW5pdHk7XG4gICAgY29uc3QgaWdub3JlTW9kdWxlID0gKG5hbWUpID0+IG9wdGlvbnMuaWdub3JlRXh0ZXJuYWwgJiYgaXNFeHRlcm5hbE1vZHVsZShcbiAgICAgIG5hbWUsXG4gICAgICByZXNvbHZlKG5hbWUsIGNvbnRleHQpLFxuICAgICAgY29udGV4dCxcbiAgICApO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tTb3VyY2VWYWx1ZShzb3VyY2VOb2RlLCBpbXBvcnRlcikge1xuICAgICAgaWYgKGlnbm9yZU1vZHVsZShzb3VyY2VOb2RlLnZhbHVlKSkge1xuICAgICAgICByZXR1cm47IC8vIGlnbm9yZSBleHRlcm5hbCBtb2R1bGVzXG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5hbGxvd1Vuc2FmZUR5bmFtaWNDeWNsaWNEZXBlbmRlbmN5ICYmIChcbiAgICAgICAgLy8gSWdub3JlIGBpbXBvcnQoKWBcbiAgICAgICAgaW1wb3J0ZXIudHlwZSA9PT0gJ0ltcG9ydEV4cHJlc3Npb24nIHx8XG4gICAgICAgIC8vIGByZXF1aXJlKClgIGNhbGxzIGFyZSBhbHdheXMgY2hlY2tlZCAoaWYgcG9zc2libGUpXG4gICAgICAgIChpbXBvcnRlci50eXBlID09PSAnQ2FsbEV4cHJlc3Npb24nICYmIGltcG9ydGVyLmNhbGxlZS5uYW1lICE9PSAncmVxdWlyZScpKSkge1xuICAgICAgICByZXR1cm47IC8vIGN5Y2xlIHZpYSBkeW5hbWljIGltcG9ydCBhbGxvd2VkIGJ5IGNvbmZpZ1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGltcG9ydGVyLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicgJiYgKFxuICAgICAgICAgIC8vIGltcG9ydCB0eXBlIHsgRm9vIH0gKFRTIGFuZCBGbG93KVxuICAgICAgICAgIGltcG9ydGVyLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fFxuICAgICAgICAgIC8vIGltcG9ydCB7IHR5cGUgRm9vIH0gKEZsb3cpXG4gICAgICAgICAgaW1wb3J0ZXIuc3BlY2lmaWVycy5ldmVyeSgoeyBpbXBvcnRLaW5kIH0pID0+IGltcG9ydEtpbmQgPT09ICd0eXBlJylcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybjsgLy8gaWdub3JlIHR5cGUgaW1wb3J0c1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbXBvcnRlZCA9IEV4cG9ydHMuZ2V0KHNvdXJjZU5vZGUudmFsdWUsIGNvbnRleHQpO1xuXG4gICAgICBpZiAoaW1wb3J0ZWQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47ICAvLyBuby11bnJlc29sdmVkIHRlcnJpdG9yeVxuICAgICAgfVxuXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gbXlQYXRoKSB7XG4gICAgICAgIHJldHVybjsgIC8vIG5vLXNlbGYtaW1wb3J0IHRlcnJpdG9yeVxuICAgICAgfVxuXG4gICAgICBjb25zdCB1bnRyYXZlcnNlZCA9IFt7IG1nZXQ6ICgpID0+IGltcG9ydGVkLCByb3V0ZTpbXSB9XTtcbiAgICAgIGZ1bmN0aW9uIGRldGVjdEN5Y2xlKHsgbWdldCwgcm91dGUgfSkge1xuICAgICAgICBjb25zdCBtID0gbWdldCgpO1xuICAgICAgICBpZiAobSA9PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmICh0cmF2ZXJzZWQuaGFzKG0ucGF0aCkpIHJldHVybjtcbiAgICAgICAgdHJhdmVyc2VkLmFkZChtLnBhdGgpO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHsgZ2V0dGVyLCBkZWNsYXJhdGlvbnMgfV0gb2YgbS5pbXBvcnRzKSB7XG4gICAgICAgICAgaWYgKHRyYXZlcnNlZC5oYXMocGF0aCkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IHRvVHJhdmVyc2UgPSBbLi4uZGVjbGFyYXRpb25zXS5maWx0ZXIoKHsgc291cmNlLCBpc09ubHlJbXBvcnRpbmdUeXBlcyB9KSA9PlxuICAgICAgICAgICAgIWlnbm9yZU1vZHVsZShzb3VyY2UudmFsdWUpICYmXG4gICAgICAgICAgICAvLyBJZ25vcmUgb25seSB0eXBlIGltcG9ydHNcbiAgICAgICAgICAgICFpc09ubHlJbXBvcnRpbmdUeXBlcyxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLypcbiAgICAgICAgICBJZiBjeWNsaWMgZGVwZW5kZW5jeSBpcyBhbGxvd2VkIHZpYSBkeW5hbWljIGltcG9ydCwgc2tpcCBjaGVja2luZyBpZiBhbnkgbW9kdWxlIGlzIGltcG9ydGVkIGR5bmFtaWNhbGx5XG4gICAgICAgICAgKi9cbiAgICAgICAgICBpZiAob3B0aW9ucy5hbGxvd1Vuc2FmZUR5bmFtaWNDeWNsaWNEZXBlbmRlbmN5ICYmIHRvVHJhdmVyc2Uuc29tZShkID0+IGQuZHluYW1pYykpIHJldHVybjtcblxuICAgICAgICAgIC8qXG4gICAgICAgICAgT25seSByZXBvcnQgYXMgYSBjeWNsZSBpZiB0aGVyZSBhcmUgYW55IGltcG9ydCBkZWNsYXJhdGlvbnMgdGhhdCBhcmUgY29uc2lkZXJlZCBieVxuICAgICAgICAgIHRoZSBydWxlLiBGb3IgZXhhbXBsZTpcblxuICAgICAgICAgIGEudHM6XG4gICAgICAgICAgaW1wb3J0IHsgZm9vIH0gZnJvbSAnLi9iJyAvLyBzaG91bGQgbm90IGJlIHJlcG9ydGVkIGFzIGEgY3ljbGVcblxuICAgICAgICAgIGIudHM6XG4gICAgICAgICAgaW1wb3J0IHR5cGUgeyBCYXIgfSBmcm9tICcuL2EnXG4gICAgICAgICAgKi9cbiAgICAgICAgICBpZiAocGF0aCA9PT0gbXlQYXRoICYmIHRvVHJhdmVyc2UubGVuZ3RoID4gMCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgaWYgKHJvdXRlLmxlbmd0aCArIDEgPCBtYXhEZXB0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHNvdXJjZSB9IG9mIHRvVHJhdmVyc2UpIHtcbiAgICAgICAgICAgICAgdW50cmF2ZXJzZWQucHVzaCh7IG1nZXQ6IGdldHRlciwgcm91dGU6IHJvdXRlLmNvbmNhdChzb3VyY2UpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3aGlsZSAodW50cmF2ZXJzZWQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gdW50cmF2ZXJzZWQuc2hpZnQoKTsgLy8gYmZzIVxuICAgICAgICBpZiAoZGV0ZWN0Q3ljbGUobmV4dCkpIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gKG5leHQucm91dGUubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyBgRGVwZW5kZW5jeSBjeWNsZSB2aWEgJHtyb3V0ZVN0cmluZyhuZXh0LnJvdXRlKX1gXG4gICAgICAgICAgICA6ICdEZXBlbmRlbmN5IGN5Y2xlIGRldGVjdGVkLicpO1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KGltcG9ydGVyLCBtZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihtb2R1bGVWaXNpdG9yKGNoZWNrU291cmNlVmFsdWUsIGNvbnRleHQub3B0aW9uc1swXSksIHtcbiAgICAgICdQcm9ncmFtOmV4aXQnOiAoKSA9PiB7XG4gICAgICAgIHRyYXZlcnNlZC5jbGVhcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbn07XG5cbmZ1bmN0aW9uIHJvdXRlU3RyaW5nKHJvdXRlKSB7XG4gIHJldHVybiByb3V0ZS5tYXAocyA9PiBgJHtzLnZhbHVlfToke3MubG9jLnN0YXJ0LmxpbmV9YCkuam9pbignPT4nKTtcbn1cbiJdfQ==