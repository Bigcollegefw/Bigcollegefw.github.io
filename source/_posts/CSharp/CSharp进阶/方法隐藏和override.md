在 C# 中，如果父类的方法没有使用`virtual`关键字声明，子类直接定义一个同名方法且不加`override` **不会报错**，但会产生不同的行为。这种情况称为**方法隐藏**（Method Hiding），而非重写（Override）。

### 具体规则和行为：

1. **父类方法未声明为`virtual`**  
    此时子类无法通过`override`关键字重写该方法。若子类定义同名方法，编译器会默认使用`new`关键字隐式隐藏父类方法。例如：
    
    csharp
    
    ```csharp
    public class Parent {
        public void DoSomething() {
            Console.WriteLine("Parent");
        }
    }
    
    public class Child : Parent {
        public void DoSomething() { // 隐式等价于 `public new void DoSomething()`
            Console.WriteLine("Child");
        }
    }
    ```
    
      
    
2. **方法隐藏（`new`关键字）的效果**
    
    - 当通过**子类实例**调用该方法时，会执行子类的版本。
    - 当通过**父类引用**指向子类实例时，会执行父类的版本。  
        示例：
        
        csharp
        
        ```csharp
        Child child = new Child();
        child.DoSomething(); // 输出 "Child"
        
        Parent parentRef = child;
        parentRef.DoSomething(); // 输出 "Parent"（即使引用的是子类实例）
        ```
        
          
        
3. **显式使用`new`关键字**  
    虽然编译器允许隐式隐藏，但建议显式使用`new`关键字声明，以避免代码歧义：
    
    csharp
    
    ```csharp
    public class Child : Parent {
        public new void DoSomething() { // 显式声明隐藏父类方法
            Console.WriteLine("Child");
        }
    }
    ```
    
      
    

### 与`override`的关键区别：

|**特性**|**方法隐藏 (`new`)**|**方法重写 (`override`)**|
|---|---|---|
|**父类方法修饰符**|无需`virtual`/`abstract`|必须为`virtual`/`abstract`|
|**子类方法修饰符**|`new`（隐式或显式）|`override`|
|**运行时行为**|基于引用类型决定调用版本|基于实例类型决定调用版本（多态）|
|**父类引用指向子类**|调用父类方法|调用子类方法|

### 常见问题和建议：

- **为什么不报错？**  
    方法隐藏是 C# 允许的合法语法，编译器不会强制要求显式声明`new`。但会发出警告（CS0108），提示 “隐藏了继承的成员”。
    
- **建议做法**：
    
    1. 如果父类方法需要被重写，应显式声明为`virtual`。
    2. 如果子类需要隐藏父类方法，建议显式使用`new`关键字，提高代码可读性。
    3. 避免在父子类中定义同名方法（除非明确需要隐藏），减少混淆。

### 示例验证：

csharp

```csharp
public class Base {
    public void Print() { Console.WriteLine("Base"); }
}

public class Derived : Base {
    public new void Print() { Console.WriteLine("Derived"); } // 显式隐藏
}

// 使用示例
Base b = new Derived();
b.Print(); // 输出 "Base"

Derived d = new Derived();
d.Print(); // 输出 "Derived"
```

- **`override` 是 “重写”**：子类完全替换了父类方法的实现，且无法再通过子类实例直接调用父类的原方法（除非在子类中用 `base.方法名()` 显式调用）。
- **`new` 是 “隐藏”**：子类的方法只是 “覆盖” 了父类方法的名称，但父类方法本身依然存在，通过父类引用或 `base` 关键字仍可访问。
- - **`override` 实现多态**：父类引用指向子类实例时，调用的是子类的重写版本。
- **父类的虚函数仍然存在**：可以通过 `base` 关键字在子类中调用，或通过创建父类实例直接调用。
- **与 `new` 的本质区别**：`override` 是运行时动态绑定，而 `new` 是编译时静态绑定。