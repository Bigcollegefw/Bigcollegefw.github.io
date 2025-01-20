### 是什么
UGUI中处理玩家单选框多选框相关交互的关键组件

开关组件，默认是多选框，配合ToggleGroup制作单选框

默认创建由4个对象组成
父对象——Toggle组件依附
子对象——背景图，选中图，说明文字（可选）

### 参数：
isOn:当前是否处于打开状态
ToggleTransition：在开关值变化时的过渡方式
	None:无过渡效果
	Fade：淡入淡出
Graphic：表示用于选中状态的图片，但默认不会改，该下面的子对象图片即可
Group：单选框分组：注意：单选框分组组件可以挂载在任何对象上，只需要个一组单选框关联即可
	配合一个组件拖进来使用
### 代码控制
```C#
Toggle tog = this.GetComponent<Toggle>();
tog.isOn = true;

ToggleGroup togGroup = this.GetComponent<ToggleGroup>();
togGroup.allowSwitchOff = true;

//得到激活状态下的Toggle
foreach(Toggle item in togGroup.ActiveToggles())
{
	print(item.name + " " + item.isOn);
	
}
```

### 监听事件的两种方式
1.拖脚本
```
public void ChangeValue(bool isOn)
{
	print("状态改变" + isOn);
}
```
代码添加
```
tog.onValueChange.AddListener(ChangeValue2);

tog.onValueChange.AddListener((v) =>{
	print("代码添加的监听" + v )
})

private

```
会把当前监听到的值传进来就是v
