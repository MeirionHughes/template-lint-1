
import {Linter, Rule} from 'template-lint';
import {BindingRule} from '../source/rules/binding';
import {Reflection} from '../source/reflection';
import {ASTNode} from '../source/ast';

describe("Syntax and Static Typing Rule", () => {

  it("will fail bad repeat.for syntax", (done) => {
    var linter: Linter = new Linter([
      new BindingRule(new Reflection())
    ]);
    linter.lint('<div repeat.for="item of"></div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Incorrect syntax for "for"')
        done();
      });
  });

  it("will fail bad interpolation syntax in text node", (done) => {
    var linter: Linter = new Linter([
      new BindingRule(new Reflection())
    ]);
    linter.lint('<div>${..}</div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Parser Error')
        done();
      });
  });

  it("accepts good interpolation binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      \${name}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("accepts good interpolation within attribute value", (done) => {
    let viewmodel = `
    export class Foo{
      width:number;
      height:number;
    }`
    let view = `
    <template>
      <div css="width: \${width}px; height: \${height}px;"></div>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("rejects bad interpolation within attribute value", (done) => {
    let viewmodel = `
    export class Foo{
      width:number;
      height:number;
    }`
    let view = `
    <template>
      <div css="width: \${widt}px; height: \${hight}px;"></div>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(2);
        expect(issues[0].message).toBe("cannot find 'widt' in type 'Foo'");
        expect(issues[1].message).toBe("cannot find 'hight' in type 'Foo'");
        done();
      })
  });

  it("rejects bad interpolation binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      \${nam}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1)
          expect(issues[0].message).toBe("cannot find 'nam' in type 'Foo'");
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("accepts good if.bind", (done) => {
    let viewmodel = `
    export class Foo{
      condition:boolean
    }`
    let view = `
    <template>
      <div if.bind="condition"></div>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("accepts good negated if.bind", (done) => {
    let viewmodel = `
    export class Foo{
      condition:boolean
    }`
    let view = `
    <template>
      <div if.bind="!condition"></div>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("accepts good attribute binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });


  it("accepts good attribute binding to imported type", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template>
      \${item.info}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("rejects bad attribute binding to imported type", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;
    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`;
    let view = `
    <template>
      \${item.infooo}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'infooo' in type 'Item'");
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("accepts good with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template with.bind="item"></template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("rejects bad with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template with.bind="itm"></template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'itm' in type 'Foo'");
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("accepts good repeat.for attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of items">    
      \${item}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("accepts good repeat.for attribute valid of imported interface", (done) => {
    let item = `
    export interface Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of items">
      \${item}
      \${item.info}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("supports repeat.for when iterating an unknown", (done) => {

    let viewmodel = `
    import {Router} from 'not-defined'
    export class Foo{
       @bindable router: Router;
    }`
    let view = `
    <template>    
      <li repeat.for="row of router.navigation">
          <a href.bind="row.href">\${row.title}</a>
      </li>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } 
        catch(error)
        {
          fail(error);
        }
        finally{
          done();
        }     
      })
  });
  
  it("rejects bad with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of itms"></template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'itms' in type 'Foo'");
        }
        catch (error) { expect(error).toBeUndefined() }
        finally { done(); }
      })
  });

  it("correctly find view-model regardless of class name", (done) => {
    let viewmodel = `
    export class ChooChoo{
      name:string
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
      \${nam}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo-camel.ts", viewmodel);
    linter.lint(view, "./foo-camel.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("cannot find 'nam' in type 'ChooChoo'");
        done();
      })
  });

  it("supports chain traversal via method return type", (done) => {
    let role = `
    export class Role{
      isAdmin:boolean;      
    }
    `
    let person = `    
    import {Role} from './role';   
    export class Person{    
       getRole():Role{}
    }`
    let viewmodel = ` 
    import {Person} from './nested/person';   
    export class Foo{
      getPerson():Person{}
    }`
    let view = `
    <template>     
        \${getPerson().getRole().isAdmin}
        \${getPerson().getRole().isAdmi}
        \${getPerson().rol}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./nested/person.ts", person);
    reflection.add("./nested/role.ts", role);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(2);
        try {
          expect(issues[0].message).toBe("cannot find 'isAdmi' in type 'Role'");
          expect(issues[1].message).toBe("cannot find 'rol' in type 'Person'");
        } finally { done(); }
      })
  });

  it("supports $parent access scope", (done) => {
    let role = `
    export class Role{
      isAdmin:boolean;      
    }
    `
    let person = `    
    import {Role} from './role';   
    export class Person{    
       role:Role; 
    }`
    let viewmodel = ` 
    import {Person} from './person';   
    export class Foo{
      person:Person; 
    }`
    let view = `
    <template with.bind="person">
      <template with.bind="role">
        \${$parent.$parent.person.role.isAdmn}
        \${$parent.$parent.person.role.isAdmin}
        \${$parent.role.isAdmin} 
      </template>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./person.ts", person);
    reflection.add("./role.ts", role);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("cannot find 'isAdmn' in type 'Role'");
        done();
      })
  });

  it("will accept use of local created in same element", (done) => {
    let person = `      
    export class Person{           
       id:number;
       fullName:string;
    }`
    let viewmodel = ` 
    import {Person} from './person';   
    export class Foo{
      employees:Person[]; 
    }`
    let view = `
    <template>
        <option repeat.for="employee of employees" model.bind = "employee.id" > 
          \${employee.fullName } 
        </option>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./person.ts", person);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("will accept use of local created in same element, before it is created", (done) => {
    let person = `      
    export class Person{           
       id:number;
       fullName:string;
    }`
    let viewmodel = ` 
    import {Person} from './person';   
    export class Foo{
      employees:Person[]; 
    }`
    let view = `
    <template>
        <option model.bind = "employee.id" repeat.for="employee of employees"  > 
          \${employee.fullName } 
        </option>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./person.ts", person);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("will reject access of private member", (done) => {
    let viewmodel = `
    export class Foo{
      private name:string;
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("field 'name' in type 'Foo' has private access modifier");
        done();
      })
  });

  it("will reject access of protected member (with default settings)", (done) => {
    let viewmodel = `
    export class Foo{
      protected name:string;
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("field 'name' in type 'Foo' has protected access modifier");
        done();
      })
  });

  it("will not reject access of protected member if only private access modifier is restricted", (done) => {
    let viewmodel = `
    export class Foo{
        private privateMember:string;
        protected protectedMember:string;
    }`
    let view = `
    <template>
      <input type="text" value.bind="privateMember">
      <input type="text" value.bind="protectedMember">
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, {restrictedAccess: ["private"]});
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("field 'privateMember' in type 'Foo' has private access modifier");
        done();
      })
  });

  it("supports custom typings", (done) => {
    let lib = `
    declare module 'my-lib' {
        export interface Person{
          name:string;
        }
    }`
    let viewmodel = `
    import {Person} from 'my-lib';
    export class Foo{
      person:Person;
    }`
    let view = `
    <template>
      \${person.name}
      \${person.nme}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    reflection.addTypings(lib);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("cannot find 'nme' in type 'Person'");
        done();
      })
  });

  it("supports bindable field", (done) => {
    let item = `      
    export class Item{           
       name:string;
    }`
    let viewmodel = `
    import {bindable} from "aurelia-framework";
    import {Item} from './item'
    export class ItemCustomElement {
        @bindable value: Item;
    }`
    let view = `
    <template>
      \${value}
      \${valu}
      \${value.name}      
      \${value.nae}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(2);
        expect(issues[0].message).toBe("cannot find 'valu' in type 'ItemCustomElement'");        
        expect(issues[1].message).toBe("cannot find 'nae' in type 'Item'");
        done();
      })
  });

  it("supports public property from constructor argument", (done) => {
    let viewmodel = `
    export class ConstructorFieldCustomElement {
      constructor(public constructorPublicField:string, justAConstructorArgument: string, private constructorPrivateField: string){}
    }`
    let view = `
    <template>
      \${constructorPublicField}
      \${justAConstructorArgument}
      \${constructorPrivateField}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(2);
        expect(issues[0].message).toBe("cannot find 'justAConstructorArgument' in type 'ConstructorFieldCustomElement'");
        expect(issues[1].message).toBe("field 'constructorPrivateField' in type 'ConstructorFieldCustomElement' has private access modifier");
        done();
      })
  });

  it("supports keyed-access (expression)", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
      index:number;
    }`
    let view = `
    <template>    
      \${items[index].info}
      \${items[indx].inf}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(2);
          expect(issues[0].message).toBe("cannot find 'indx' in type 'Foo'");
          expect(issues[1].message).toBe("cannot find 'inf' in type 'Item'");
        } finally { done(); }
      })
  });

  //#59
  it("supports getters", (done) => {
    let item = `
    export class Item{
      value:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      get item(): Item {}
    }`
    let view = `
    <template>    
      \${item}
      \${item.value}
      \${item.vale}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'vale' in type 'Item'");
        } 
        catch(err){fail(err);}
        finally { done(); }
      })
  });

  it("support javascript (untyped) source", (done) => {
    let viewmodel = `
    export class Foo{
      items;
      index;
    }`
    let view = `
    <template> 
      \${items};
      \${index};
      \${item};
      \${indx};
      \${items[index]}
      \${items[index].info}
      \${index.will.never.know.how.wrong.this.is}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.js", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(2);
          expect(issues[0].message).toBe("cannot find 'item' in type 'Foo'");
          expect(issues[1].message).toBe("cannot find 'indx' in type 'Foo'");
        } finally { done(); }
      })
  });

  
  //#58
  it("supports access to typed Array-object members", (done) => {
    let item = `
    export interface Item{
      value:string;
    }`;

    let viewmodel = `
    import {Item} from './item
    export class Foo{
      items: Item[];
    }`
    let view = `
    <template>    
      \${items.length}
      \${items.lengh}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'lengh' in object 'Array'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });

  //#68
  it("supports inheritence of classes", (done) => {
    let base = `
    export class Base{
      value:string;
    }`;

    let viewmodel = `
    import {Base} from './base
    export class Foo extends Base{
    }`

    let view = `
    <template>    
      \${value}
      \${valu}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./base.ts", base);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'valu' in type 'Foo'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });

  
  //#68
  it("supports inheritence of interfaces", (done) => {
    let item = `
    export interface BaseItem {
        name: string;
    }

    export interface Item extends BaseItem {
        value: string;
    }`;

    let viewmodel = `
    import {Item} from './item
    export class Foo{
      item: Item;
    }`

    let view = `
    <template>    
     \${item.name}
     \${item.value}
     \${item.valu}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'valu' in type 'Item'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });

  //#66
  it("supports classes declared in same-file", (done) => {
    let item = `
    export class Price{
      value:string;
    }
    export class Item{
      name:string;
      price:Price
    }`;

    let viewmodel = `
    import {Item} from './item
    export class Foo {
      item:Item;
    }`

    let view = `
    <template>    
      \${item.name}
      \${item.price.value}
      \${item.price.valu}
    </template>`

    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'valu' in type 'Price'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });

   //#66
  it("supports interfaces declared in same-file", (done) => {
    let item = `
    export interface Price{
      value:string;
    }
    export interface Item{
      name:string;
      price:Price
    }`;

    let viewmodel = `
    import {Item} from './item
    export class Foo {
      item:Item;
    }`

    let view = `
    <template>    
      \${item.name}
      \${item.price.value}
      \${item.price.valu}
    </template>`

    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'valu' in type 'Price'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });


  /*it("rejects more than one class in view-model file", (done) => {
    let viewmodel = `
    export class ChooChoo{
      name:string
    }
    export class Moo{}`
    let view = `
    <template>
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        expect(issues.length).toBe(1);
        if (issues.length === 1) {
          expect(issues[0].message).toBe("view-model file should only have one class");
        }
        done();
      })
  });*/

  /*it("supports generics", (done) => {
    
    let cat = `
    export class Cat{
      color:string;      
    }`;
    let person = `
    export class Person<T>{
      name:string;
      pet:T;
    }`;

    let viewmodel = `
    import {Person} from './path/person'
    import {Cat} from './path/cat'
    export class Foo{
      person:Person<Cat>
    }`
    let view = `
    <template>
      \${person}
      \${person.pet}      
      \${person.pet.color}        
      \${person.pet.colr}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/person.ts", person);    
    reflection.add("./path/cat.ts", cat);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(2);
          expect(issues[0].message).toBe("cannot find 'colr' in type 'Cat'")
          expect(issues[1].message).toBe("cannot find 'corl' in type 'Cat'")
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });*/
});