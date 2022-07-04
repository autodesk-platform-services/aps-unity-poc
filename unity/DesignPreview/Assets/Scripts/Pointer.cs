using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Pointer : MonoBehaviour
{
    public GameObject Model;

    void Update()
    {
        RaycastHit hit;
        var gltf = Model.GetComponent<GltfLoader>();
        if (Physics.Raycast(transform.position, transform.TransformDirection(Vector3.up), out hit, Mathf.Infinity))
        {
            Debug.DrawRay(transform.position, transform.TransformDirection(Vector3.up) * hit.distance, Color.green);
            var mesh = hit.collider.transform.GetComponent<MeshFilter>().mesh;
            var i1 = mesh.triangles[hit.triangleIndex * 3];
            // var i2 = mesh.triangles[hit.triangleIndex * 3 + 1];
            // var i3 = mesh.triangles[hit.triangleIndex * 3 + 2];
            var colors32 = gltf.ColorsDictionary[mesh];
            var c1 = colors32[i1];
            // var c2 = colors32[i2];
            // var c3 = colors32[i3];
            var dbid = ColorToID(c1);
            // Debug.Log("Object ID " + dbid);
        }
        else
        {
            Debug.DrawRay(transform.position, transform.TransformDirection(Vector3.up) * 1000, Color.red);
        }
    }

    int ColorToID(Color32 color)
    {
        return color.r + (color.g << 8) + (color.b << 16) + (color.a << 24);
    }
}
