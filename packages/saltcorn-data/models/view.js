const db = require("../db");
const Form = require("../models/form");
const { contract, is } = require("contractis");
const { fieldlike } = require("../contracts");

const removeEmptyStrings = obj => {
  var o = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== "" && v !== null) o[k] = v;
  });
  return o;
};

class View {
  constructor(o) {
    this.name = o.name;
    this.id = o.id;
    this.viewtemplate = o.viewtemplate;
    if (o.table_id) this.table_id = o.table_id;
    if (o.table) {
      this.table = o.table;
      if (o.table.id && !o.table_id) this.table_id = o.table.id;
    }
    this.configuration = o.configuration;
    this.is_public = o.is_public;
    this.on_root_page = o.on_root_page;
    this.on_menu = o.on_menu;
    const State = require("../db/state");
    this.viewtemplateObj = State.viewtemplates[this.viewtemplate];
    contract.class(this);
  }
  static async findOne(where) {
    const v = await db.selectOne("views", where);
    return new View(v);
  }
  static async find(where, selectopts) {
    const views = await db.select("views", where, selectopts);

    return views.map(v => new View(v));
  }

  async get_state_fields() {
    if (this.viewtemplateObj.get_state_fields) {
      return await this.viewtemplateObj.get_state_fields(
        this.table_id,
        this.name,
        this.configuration
      );
    } else return [];
  }

  static async find_table_views_where(table_id, pred) {
    var link_view_opts = [];
    const link_views = await View.find({
      table_id
    });

    for (const viewrow of link_views) {
      try {
        // may fail if incomplete view
        const sfs = await viewrow.get_state_fields();
        if (
          pred({
            viewrow,
            viewtemplate: viewrow.viewtemplateObj,
            state_fields: sfs
          })
        )
          link_view_opts.push(viewrow);
      } catch {}
    }
    return link_view_opts;
  }

  static async find_all_views_where(pred) {
    var link_view_opts = [];
    const link_views = await View.find({});

    for (const viewrow of link_views) {
      try {
        // may fail if incomplete view
        const sfs = await viewrow.get_state_fields();
        if (
          pred({
            viewrow,
            viewtemplate: viewrow.viewtemplateObj,
            state_fields: sfs
          })
        )
          link_view_opts.push(viewrow);
      } catch {}
    }
    return link_view_opts;
  }

  static async find_possible_links_to_table(table_id) {
    return View.find_table_views_where(table_id, ({ state_fields }) =>
      state_fields.some(sf => sf.name === "id")
    );
  }

  static async create(v) {
    const id = await db.insert("views", v);
    await require("../db/state").refresh();
    return new View({ id, ...v });
  }
  async delete() {
    await db.query("delete FROM views WHERE id = $1", [this.id]);
  }
  static async update(v, id) {
    await db.update("views", v, id);
    await require("../db/state").refresh();
  }
  static async delete(where) {
    await db.deleteWhere("views", where);
    await require("../db/state").refresh();
  }
  async run(query, extraArgs) {
    return await this.viewtemplateObj.run(
      this.table_id,
      this.name,
      this.configuration,
      removeEmptyStrings(query),
      extraArgs
    );
  }

  async runPost(query, body, extraArgs) {
    return await this.viewtemplateObj.runPost(
      this.table_id,
      this.name,
      this.configuration,
      removeEmptyStrings(query),
      removeEmptyStrings(body),
      extraArgs
    );
  }
  async get_state_form(query) {
    if (this.viewtemplateObj.display_state_form) {
      const fields = await this.get_state_fields();

      fields.forEach(f => {
        f.required = false;
        if (f.type && f.type.name === "Bool") f.fieldview = "tristate";
      });
      const form = new Form({
        methodGET: true,
        action: `/view/${this.name}`,
        fields,
        submitLabel: "Apply",
        isStateForm: true,
        values: removeEmptyStrings(query)
      });
      await form.fill_fkey_options(true);
      return form;
    } else return null;
  }

  async get_config_flow() {
    const configFlow = this.viewtemplateObj.configuration_workflow();
    configFlow.action = `/viewedit/config/${this.name}`;
    const oldOnDone = configFlow.onDone || (c => c);
    configFlow.onDone = async ctx => {
      const { table_id, ...configuration } = oldOnDone(ctx);

      await View.update({ configuration }, this.id);

      return { redirect: `/viewedit/list` };
    };
    return configFlow;
  }
}

View.contract = {
  variables: {
    name: is.str,
    id: is.posint,
    viewtemplate: is.str,
    viewtemplateObj: is.obj({ name: is.str, display_state_form: is.bool })
  },
  methods: {
    get_state_fields: is.fun([], is.promise(is.array(fieldlike))),
    get_state_form: is.fun(is.obj(), is.promise(is.maybe(is.class("Form")))),
    get_config_flow: is.fun([], is.promise(is.class("Workflow")))
  },
  static_methods: {
    find: is.fun(
      [is.maybe(is.obj()), is.maybe(is.obj())],
      is.promise(is.array(is.class("View")))
    ),
    findOne: is.fun(is.obj(), is.promise(is.class("View"))),
    create: is.fun(is.obj(), is.promise(is.class("View"))),
    find_possible_links_to_table: is.fun(
      is.posint,
      is.promise(is.array(is.class("View")))
    ),
    find_all_views_where: is.fun(
      is.fun(
        is.obj({
          viewrow: is.class("View"),
          viewtemplate: is.obj(),
          state_fields: is.array(fieldlike)
        }),
        is.bool
      ),
      is.promise(is.array(is.class("View")))
    ),
    find_table_views_where: is.fun(
      [
        is.posint,
        is.fun(
          is.obj({
            viewrow: is.class("View"),
            viewtemplate: is.obj(),
            state_fields: is.array(fieldlike)
          }),
          is.bool
        )
      ],
      is.promise(is.array(is.class("View")))
    )
  }
};
module.exports = View;
