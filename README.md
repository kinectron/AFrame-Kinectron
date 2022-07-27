# AFrame-Kinectron
[A-Frame](https://github.com/aframevr/aframe) component for [Kinectron](https://github.com/kinectron/kinectron) based on the [Three-Kinectron](https://github.com/kinectron/Three-Kinectron) plugin.
Renders a point cloud from Kinect depth data provided by the Kinectron Server/API.


#### Usage:

###### Example:

```html
    <a-scene>
        <a-entity position="0 1 -0" kinectron="host:127.0.0.1; type: rgbd; pointSize: 0.1; colorOffSet: 0 0 0 0; brightness: 0.1; contrast: 1.0; opacity: 1.0; filterAmount: 0.9" scale="5. 5. 10."></a-entity>
    </a-scene>
```

###### Attributes:

| Property | Description | Default |
| ------------- | ------------- | ------------- |
| host  | IP/URL to Kinectron server host.  | 127.0.0.1  |
| type | Type of depth data. Choose 'rgbd' for RGB and alpha encoded depth, and 'depth' for gray-scale. | rgbd  |
| pointSize | scale of rendered points  | 1.0  |
| colorOffSet | Offset of red, green, blue and alpha channel (0.-1.)  | 0 0 0 0 |
| brightness | Brightness of texture  | 0. |
| contrast | Contrast of texture | 1. |
| opacity | Opacity of texture | 1. |
| filterAmount | Amount of filtering | 0.9 |

#### ToDo:
- Add Kinect Azure support

#### Credits

written by Damian Dziwis @github/AudioGroupCologne  

Based on the works of [Or Fleisher](https://github.com/juniorxsound) [Three-Kinectron](https://github.com/kinectron/Three-Kinectron) and [Depthkit.js](https://github.com/juniorxsound/DepthKit.js)

Kinectron is maintained by [Lisa Jamhoury](http://lisajamhoury.com) with support from [Aarón Montoya-Moraga](https://github.com/montoyamoraga). It was originally developed by [Shawn van Every](https://github.com/vanevery) and [Lisa Jamhoury](https://github.com/lisajamhoury/) at New York University's Interactive Telecommunications Program (NYU ITP) under the xStory Experiments in Storytelling Google Research Grant, which supports experiments with emerging technology in service of new forms of storytelling.

Past collaborators include [Stephanie Koltun](https://github.com/stephkoltun), [Or Fleisher](https://github.com/juniorxsound), [Tiri Kananuruk](http://xxx.tiri.xxx/), and [Dror Ayalon](https://www.drorayalon.com/).

