using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.Networking;

[Serializable]
public class Model
{
    public string name;
    public string urn;
}

[Serializable]
public class Models
{
    public Model[] items;
}

[Serializable]
public class ConversionJob
{
    public string urn;
    public string guid;
    public string status;
    public string created;
    public string updated;
    public ConversionJobOutputs outputs;
}

[Serializable]
public class ConversionJobOutputs
{
    public string glb;
}

public class ModelList : MonoBehaviour
{
    public string host;
    public GameObject scene;
    private Models models;

    // Start is called before the first frame update
    void Start()
    {
        var dropdown = GetComponent<TMP_Dropdown>();
        if (dropdown == null)
        {
            Debug.LogWarning("Dropdown component not found.");
            return;
        }
        StartCoroutine(LoadModelList(dropdown));
        dropdown.onValueChanged.AddListener(OnValueChanged);
    }

    // Update is called once per frame
    void Update()
    {
    }

    void OnValueChanged(int index)
    {
        Debug.Log("Selected model: " + models.items[index].name);
        StartCoroutine(LoadModel(models.items[index]));
    }

    IEnumerator LoadModelList(TMP_Dropdown dropdown)
    {
        Debug.Log("Retrieving model list from " + host);
        UnityWebRequest www = UnityWebRequest.Get(host + "/api/models");
        yield return www.SendWebRequest();
        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError(www.error);
        }
        else
        {
            Debug.Log("Model list loaded");
            models = JsonUtility.FromJson<Models>("{ \"items\": " + www.downloadHandler.text + " }");
            dropdown.ClearOptions();
            var options = new List<TMP_Dropdown.OptionData>();
            foreach (var model in models.items)
            {
                options.Add(new TMP_Dropdown.OptionData(model.name));
            }
            dropdown.AddOptions(options);
        }
    }

    IEnumerator LoadModel(Model model)
    {
        Debug.Log("Checking status of " + model.name);
        UnityWebRequest www = UnityWebRequest.Get(host + "/api/jobs/" + model.urn);
        yield return www.SendWebRequest();
        if (www.result != UnityWebRequest.Result.Success)
        {
            if (www.responseCode == 404)
            {
                Debug.Log("No conversion job found for " + model.name + ". Starting a new one. Try again later.");
                StartCoroutine(ConvertModel(model));
            }
            else
            {
                Debug.LogError(www.error);
            }
        }
        else
        {
            var job = JsonUtility.FromJson<ConversionJob>(www.downloadHandler.text);
            if (job.status == "success")
            {
                Debug.Log("Loading " + model.name);
                var loader = scene.GetComponent<GltfLoader>();
                loader.SetURL(host + "/api/jobs/" + model.urn + "/" + job.outputs.glb);
            }
            else
            {
                Debug.LogWarning("Job status: " + job.status);
            }
        }
    }

    IEnumerator ConvertModel(Model model)
    {
        UnityWebRequest www = UnityWebRequest.Get(host + "/api/jobs/" + model.urn);
        www.method = "post";
        yield return www.SendWebRequest();
    }
}
