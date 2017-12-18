import { Machine } from 'stent';
import { PAGES } from '../constants';
import { enhanceEvent } from '../helpers/enhanceEvent';
import calculateMutationExplorer from '../helpers/calculateMutationExplorer';

const getFilterTypes = function () {
  const types = localStorage.getItem('kuker_filterTypes');

  if (types !== null) {
    try {
      return JSON.parse(types);
    } catch (error) {
      return null;
    }
  }
  return null;
};
const getSources = function () {
  const sources = localStorage.getItem('kuker_sources');

  if (sources !== null) {
    try {
      return JSON.parse(sources);
    } catch (error) {
      return null;
    }
  }
  return null;
};
const setFilterTypes = function (types) {
  try {
    return localStorage.setItem('kuker_filterTypes', JSON.stringify(types));
  } catch (error) {
    return {};
  }
};
const setSources = function (sources) {
  try {
    return localStorage.setItem('kuker_sources', JSON.stringify(sources));
  } catch (error) {
    return {};
  }
};

const initialState = () => ({
  name: 'working',
  page: PAGES.DASHBOARD,
  events: [],
  mutationExplorerPath: null,
  filterTypes: getFilterTypes(),
  sources: getSources()
});
const MAX_EVENTS = 400;

const DevTools = Machine.create('DevTools', {
  state: initialState(),
  transitions: {
    'working': {
      'action received': function ({ events, ...rest }, newEvents) {
        const eventsToAdd = newEvents.map((newEvent, i) => {
          if (typeof newEvent.type === 'undefined') {
            return false;
          }
          const enhancedEvent = enhanceEvent(newEvent, this.lastKnownState, rest.mutationExplorerPath);

          if (newEvent.state) {
            this.lastKnownState = newEvent.state;
          }

          return enhancedEvent;
        }).filter(newEvent => newEvent);

        if (eventsToAdd.length === 0) return undefined;

        events = events.concat(eventsToAdd);
        if (events.length > MAX_EVENTS) {
          events.splice(0, events.length - MAX_EVENTS);
        }

        return {
          events: events,
          ...rest
        };
      },
      'flush events': function () {
        return initialState();
      },
      'show mutation': function ({ events, ...rest }, mutationExplorerPath) {
        events.forEach(event => calculateMutationExplorer(event, mutationExplorerPath));

        return { events, ...rest, mutationExplorerPath };
      },
      'clear mutation': function ({ events, mutationExplorerPath, ...rest}) {
        events.forEach(event => (event.mutationExplorer = false));
        return { events, ...rest, mutationExplorerPath: null };
      },
      'update filters': function (state, { filterTypes, sources }) {
        const newFilterTypes = Object.assign({}, state.filterTypes, filterTypes);
        const newSources = Object.assign({}, state.sources, sources);

        setFilterTypes(newFilterTypes);
        setSources(newSources);
        return {
          ...state,
          filterTypes: newFilterTypes,
          sources: newSources
        };
      }
    }
  },
  getFilteredEvents() {
    const filterTypes = this.state.filterTypes;
    const sources = this.state.sources;

    return this.state.events
      .filter(({ type }) => {
        if (filterTypes !== null && typeof filterTypes[type] !== 'undefined') {
          return filterTypes[type];
        }
        return true;
      })
      .filter(({ origin }) => {
        if (sources !== null && typeof sources[origin] !== 'undefined') {
          return sources[origin];
        }
        return true;
      });
  }
});

export default DevTools;
