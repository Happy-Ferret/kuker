import React from 'react';
import PropTypes from 'prop-types';
import renderJSONPreview from './renderJSONPreview';

/*
kind - indicates the kind of change; will be one of the following:
  N - indicates a newly added property/element
  D - indicates a property/element was deleted
  E - indicates a property/element was edited
  A - indicates a change occurred within an array
path - the property path (from the left-hand-side root)
lhs - the value on the left-hand-side of the comparison (undefined if kind === 'N')
rhs - the value on the right-hand-side of the comparison (undefined if kind === 'D')
index - when kind === 'A', indicates the array index where the change occurred
item - when kind === 'A', contains a nested change record indicating the change that occurred at the array index
*/

function isDefined(value) {
  return typeof value !== 'undefined';
}
function formatKind(kind) {
  switch (kind) {
    case 'N': return <i className={ 'fa fa-plus-square ' + kind }></i>;
    case 'D': return <i className={ 'fa fa-minus-square ' + kind }></i>;
    case 'E': return <i className={ 'fa fa-pencil ' + kind }></i>;
    case 'A': return <i className={ 'fa fa-ellipsis-h ' + kind }></i>;
  }
  return '';
}
function formatSide(side) {
  if (typeof side === 'object' && side !== null) {
    return renderJSONPreview(side);
  }
  return String(side);
}
function formatPath(mutation) {
  const index = mutation.kind === 'A' ? `[ ${ mutation.index } ] ` : null;

  if (mutation.path) {
    return <strong>{ index }{ mutation.path.join('.') }</strong>;
  } else if (mutation.kind === 'A') {
    return <strong>{ index }</strong>;
  }
  return <span className='mutationLine'></span>;
}
function formatItem(mutation, indent = 0) {
  if (!mutation) return null;
  return (
    <div style={{ marginLeft: (indent * 1.5) + 'em' }}>
      <p>
        { formatKind(mutation.kind) }
        { formatPath(mutation) }
        { mutation.kind === 'A' && formatItem(mutation.item, indent + 1) }
      </p>
      <div style={{ marginLeft: '1.2em' }}>
        { isDefined(mutation.lhs) && <span>{ formatSide(mutation.lhs) } <i className='fa fa-long-arrow-right'></i> </span> }
        { isDefined(mutation.rhs) && formatSide(mutation.rhs) }
      </div>
    </div>
  );
}

export default function formatStateMutation(mutations) {
  if (!mutations) return null;
  console.log(mutations);
  return (
    <div className='stateMutation'>
      <hr />
      {
        mutations.map((mutation, i) => <div key={i}>{ formatItem(mutation) }</div>)
      }
    </div>
  );
};

formatStateMutation.PropTypes = {
  mutations: PropTypes.object
};
