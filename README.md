# Dépendence
d3.js v5

# Parameters

# Initialisation
```var accordeon = new accordeon(divContainerID, accordeonID, width, height, platform)```

# Update
```accordeon.upd([ARRAY OF DOCID])```

# Click Event to add to the maincanvas_<divContainerID> element
```document.getElementById('maincanvas_<divContainerID>').addEventListener('clickAccordeonEvent', function (e) { console.log(e.detail); }, false)```

# Resize
```accordeon.resize(width, height)```

# Example of implementation 
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title></title>
    <link rel="icon" href="images/favicon.png" />
  </head>

  <body>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js"></script>
    <script type="text/javascript" src="js/accordeon.js"></script>
    <div id="accordion_1"></div>
    <div id="accordion_2"></div>
  </body>
  <script type="text/javascript">
    // ACCORDEON 1
    var acc1 = new accordeon ('accordion_1', 300, window.innerHeight, 'https://www.scholarvox.com');

    acc1.upd(["10207436","10236404","88801261","88812296","88814404","10041558","10040354","10041573","10041671","10208890","10295020","45001392","10041681","45003640","88802579","999999999","45007613","9999999100","45006770","88819099","10208965","41000779","41000931","41001508","41001512","41001521","45006769","88801314","88803211","88813256","88815752","88819108","88820827","88832613","88840771","88848997","88809292","88813010","88813029","88813255","88816506","88817870","88833668","88836952","88840783","88842018","88870385","41000606","41000634","41000955"]);

    // L'EVENEMENT clickAccordeonEvent RENVOIE LE DOCID
    // A INSTALLER SUR LE MAINCANVAS DE L'ACCORDEON
    document.getElementById('maincanvas_accordion_1').addEventListener('clickAccordeonEvent', function (e) { console.log(e.detail); }, false);


    var acc2 = new accordeon ('accordion_2', window.innerWidth, 300, 'https://www.scholarvox.com');

    acc2.upd(["10207436","10236404","88801261","88812296","88814404","10041558","10040354","10041573","10041671","10208890","10295020","45001392","10041681","45003640","88802579","999999999","45007613","9999999100","45006770","88819099","10208965","41000779","41000931","41001508","41001512","41001521","45006769","88801314","88803211","88813256","88815752","88819108","88820827","88832613","88840771","88848997","88809292","88813010","88813029","88813255","88816506","88817870","88833668","88836952","88840783","88842018","88870385","41000606","41000634","41000955"]);

    // L'EVENEMENT clickAccordeonEvent RENVOIE LE DOCID
    // A INSTALLER SUR LE MAINCANVAS DE L'ACCORDEON
    document.getElementById('maincanvas_accordion_2').addEventListener('clickAccordeonEvent', function (e) { console.log(e.detail); }, false);


    // RESIZE
    window.addEventListener('resize', function(){ acc1.resize(300, window.innerHeight); acc2.resize(window.innerWidth, 300); });
    
  </script>
</html>
```


