import React, { Component, PureComponent } from 'react';
import assign from 'lodash/assign';
import includes from 'lodash/includes';
import Td from './Td';

// 需要传入一个组件模板
export default class Body extends (PureComponent || Component) {
  constructor(props) {
    super(props);

    const { datasets, isExpanded } = props;
    const expandItems = datasets.reduce((items, rowData, rowIndex) => {
      if (typeof isExpanded === 'function') {
        items[rowIndex] = isExpanded(rowData, rowIndex);
      } else {
        items[rowIndex] = false;
      }

      return items;
    }, {});

    this.state = {
      expandItems,
    };
  }

  handleExpand(rowIndex) {
    return () => {
      let expandItems = assign({}, this.state.expandItems);

      expandItems[rowIndex] = !(expandItems[rowIndex] || 0);

      this.setState({
        expandItems,
      });
    };
  }

  isExpanded(rowData, rowIndex) {
    return this.state.expandItems[rowIndex] || 0;
  }

  onRowClick(key) {
    const { selection } = this.props;
    if (selection.canRowSelect) {
      selection.onSelect(key, !includes(selection.selectedRowKeys, key));
    }
  }

  render() {
    let {
      datasets,
      columns,
      emptyLabel,
      rowKey,
      selection,
      getRowConf,
      expandRender,
      needExpand,
    } = this.props;

    let trs = [];
    let dataIterator = (rowData, rowIndex) => {
      let { canSelect = true, rowClass = '' } = getRowConf(rowData, rowIndex);
      const key = rowData[rowKey] || rowIndex;

      let tds = [];
      if (needExpand) {
        tds.push(
          <div key="-1" className="td expanded-item">
            <span
              className={
                this.isExpanded(rowData, rowIndex)
                  ? 'expandable-btn collapse-btn'
                  : 'expandable-btn expand-btn'
              }
              onClick={this.handleExpand(rowIndex)}
            />
          </div>
        );
      }

      columns.forEach((item, columnIndex) => {
        // 位置信息
        let pos = {
          row: rowIndex,
          column: columnIndex,
        };

        let needSelect = false;
        if (selection.needSelect && columnIndex === 0) {
          needSelect = true;
        }

        tds.push(
          <Td
            column={item}
            key={columnIndex}
            data={rowData}
            pos={pos}
            rowKey={rowKey}
            selection={{
              needSelect,
              isSingleSelection: selection.isSingleSelection,
              canSelect,
              selectedRowKeys: selection.selectedRowKeys,
              onSelect: selection.onSelect,
            }}
          />
        );
      });

      trs.push(
        <div
          className={`${rowClass} tr`}
          key={key}
          onClick={() => this.onRowClick(key)}
        >
          {tds}
        </div>
      );
    };

    let expandedInterator = (rowData, rowIndex) => {
      const key = rowData[rowKey] || rowIndex;

      trs.push(
        <div
          className="tr tr--expanded"
          key={`${key}-expand`}
          style={{
            display: this.isExpanded(rowData, rowIndex) ? 'flex' : 'none',
          }}
          onClick={() => this.onRowClick(key)}
        >
          <div className="td expanded-item" />
          <div className="td">{expandRender(rowData)}</div>
        </div>
      );
    };

    if (needExpand) {
      datasets.forEach((rowData, rowIndex) => {
        dataIterator(rowData, rowIndex);
        expandedInterator(rowData, rowIndex);
      });
    } else {
      datasets.forEach((rowData, rowIndex) => {
        dataIterator(rowData, rowIndex);
      });
    }

    return (
      <div className="tbody">
        {datasets.length !== 0 ? (
          trs
        ) : (
          <div className="tr">
            <div className="cell empty-data">{emptyLabel}</div>
          </div>
        )}
      </div>
    );
  }
}
