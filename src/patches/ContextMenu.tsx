import { common, components, util, webpack } from "replugged";

const { waitFor, getOwnerInstance } = util;
const { React, contextMenu: { close } } = common;
const { ContextMenu: { ContextMenu, MenuGroup, MenuItem, MenuCheckboxItem, MenuControlItem } } = components;
const SliderComponentModule = webpack.getBySource(".sliderContainer");
const SiderComponent = Object.values(SliderComponentModule).find(
  (m) => m?.render?.toString().includes("sliderContainer"),
)

export default class CustomContextMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public static renderRawItems(items) {
    const cm = new CustomContextMenu();
    const res = cm.renderItems(items, {
      standaone: true,
      depth: 0,
      group: 0,
      i: 0,
    });
    return res;
  }

  render() {
    if (this.props.items) {
      return this.renderItems(this.props.items, {
        depth: 0,
        group: 0,
        i: 0
      });
    }

    return (
      <ContextMenu
        navId={this.props.navId || `image-tools-${Math.random().toString(32).slice(2)}`}
        onClose={close}
      >
        {this.props.itemGroups.map((items, i) => (
          <MenuGroup>
            {this.renderItems(items, {
              depth: 0,
              group: i,
              i: 0
            })}
          </MenuGroup>
        ))}
      </ContextMenu>
    );
  }

  renderItems(items, ctx) {
    
    return items.map(item => {
      ctx.i++;
      switch (item.type) {
        case 'button':
          return this.renderButton(item, ctx);

        case 'checkbox':
          return this.renderCheckbox(item, ctx);

        case 'slider':
          return this.renderSlider(item, ctx);

        case 'submenu':
          return this.renderSubMenu(item, ctx);

        default:
          return null;
      }
    });
  }

  renderButton(item, ctx) {
    return (
      <MenuItem
        id={item.id || `item-${ctx.group}-${ctx.depth}-${ctx.i}`}
        disabled={item.disabled}
        label={item.name}
        color={item.color}
        hint={item.hint}
        subtext={item.subtext}
        action={() => {
          if (item.disabled) {
            waitFor('#app-mount > div[class] > div').then(app => getOwnerInstance(app).shake(600, 5));
          } else if (item.action) {
            item.action();
          }
        }}
      />
    );
  }

  renderCheckbox(item, ctx) {
    const elementKey = `active-${ctx.group}-${ctx.depth}-${ctx.i}`;
    const isStandalone = Boolean(ctx.standalone);
    const active = this.state[elementKey] !== void 0
      ? this.state[elementKey]
      : item.defaultState;

    return (
      <MenuCheckboxItem
        id={item.id || `item-${ctx.group}-${ctx.depth}-${ctx.i}`}
        checked={active}
        label={item.name}
        color={item.color}
        hint={item.hint}
        subtext={item.subtext}
        action={e => {
          const newActive = !active;
          if (item.onToggle) {
            item.onToggle(newActive);
          }
          if (isStandalone) {
            const el = e.target.closest('[role="menu"]');
            setImmediate(() => getOwnerInstance(el).forceUpdate());
          } else {
            this.setState({ [elementKey]: newActive });
          }
        }}
      />
    );
  }

  renderSlider(item, ctx) {
    return (
      <MenuControlItem
        id={item.id || `item-${ctx.group}-${ctx.depth}-${ctx.i}`}
        label={item.name}
        color={item.color}
        control={(props, ref) => <SiderComponent
          mini
          ref={ref}
          equidistant={typeof item.markers !== 'undefined'}
          stickToMarkers={typeof item.markers !== 'undefined'}
          {...props}
          {...item}
        />}
      />
    );
  }

  renderSubMenu(item, ctx) {
    const elementKey = `items-${ctx.group}-${ctx.depth}-${ctx.i}`;
    let items = this.state[elementKey];
    if (items === void 0) {
      items = item.getItems();
      this.setState({ [elementKey]: items });
      if (items instanceof Promise) {
        items.then(fetchedItems => this.setState({ [elementKey]: fetchedItems }));
      }
    }
    return (
      <MenuItem
        id={item.id || `item-${ctx.group}-${ctx.depth}-${ctx.i}`}
        disabled={!items || items instanceof Promise || items.length === 0 || item.disabled}
        label={item.name}
        color={item.color}
        hint={item.hint}
        subtext={item.subtext}
      >
        {items && !(items instanceof Promise) && items.length !== 0 && !item.disabled && this.renderItems(items, {
          depth: ctx.depth + 1,
          group: 0,
          i: 0
        })}
      </MenuItem>
    );
  }
}
