```C#
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System.Collections;

public class Zhuge : MonoBehaviour, IPointerClickHandler
{
    public enum State
    {
        Idle,
        Attack
    }

    [SerializeField]
    private Sprite[] idleSprites; // 普通状态动画帧序列
    [SerializeField]
    private Sprite[] attackSprites; // 攻击状态动画帧序列

    [SerializeField]
    private float frameRate = 0.1f; // 帧更新频率

    private int currentFrame = 0; // 当前动画帧索引
    private Image animatedImage; // UI Image 组件

    private State currentState = State.Idle; // 当前状态

    private void Awake()
    {
        animatedImage = this.transform.GetChild(0).GetChild(3).GetComponentInChildren<Image>();
        if (animatedImage == null)
        {
            print("No Image component!");
        }
    }

    private void Start()
    {
        StartCoroutine(Animate());
    }

    IEnumerator Animate()
    {
        while (true)
        {
            Sprite[] currentSprites = currentState == State.Attack ? attackSprites : idleSprites;
            animatedImage.sprite = currentSprites[currentFrame];

            currentFrame = (currentFrame + 1) % currentSprites.Length;

            if (currentState == State.Attack && currentFrame == currentSprites.Length - 1)
            {
                currentState = State.Idle;
            }

            yield return new WaitForSeconds(frameRate);
        }
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        if (currentState == State.Idle)
        {
            currentState = State.Attack;
            currentFrame = 0; // 重置动画帧索引
        }
    }
}
```