using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using GLTFast;

public class GltfLoader : MonoBehaviour
{
    public string URL = null;
    public Dictionary<Mesh, Color32[]> ColorsDictionary = new Dictionary<Mesh, Color32[]>();

    // Start is called before the first frame update
    void Start()
    {
        if (!string.IsNullOrEmpty(URL))
        {
            Load(URL);
        }
    }

    public void SetURL(string url)
    {
        URL = url;
        Load(URL);
    }

    async void Load(string url)
    {
        // Clear scene
        foreach (Transform child in gameObject.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        // Import glTF
        var gltf = new GltfImport();
        var settings = new ImportSettings
        {
            generateMipMaps = true,
            anisotropicFilterLevel = 3,
            nodeNameMethod = ImportSettings.NameImportMethod.OriginalUnique
        };
        var success = await gltf.Load(url, settings);
        if (success)
        {
            gltf.InstantiateMainScene(gameObject.transform);
            ColorsDictionary.Clear();
            // Detach color channels from all meshes, and store them in a dictionary for ID retrieval later
            foreach (var component in gameObject.GetComponentsInChildren<MeshFilter>())
            {
                ColorsDictionary.Add(component.mesh, component.mesh.colors32);
                component.mesh.colors32 = null;
                // Add mesh collider
                try
                {
                    component.gameObject.AddComponent<MeshCollider>();
                }
                catch (System.Exception)
                {
                    Debug.Log("Could not add mesh collider to object", component.gameObject);
                }
            }
        }
        else
        {
            Debug.LogError("Loading glTF failed!");
        }
    }
}
