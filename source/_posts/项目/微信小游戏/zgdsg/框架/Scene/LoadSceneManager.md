```C#
using UnityEngine;
using UnityEngine.SceneManagement;

public class LoadSceneManager : SingletonBase<LoadSceneManager>
{
    // Start is called before the first frame update
    void Start()
    {
        //DontDestroyOnLoad(this.gameObject);
    }

    public void LoadScene(string toSceneName)
    {
        SceneManager.UnloadSceneAsync(SceneManager.GetActiveScene().name);
        SceneManager.LoadScene(toSceneName);
    }
}
```