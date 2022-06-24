# Backend

## How to Setup?

- Create a seperate environment for the dependencies
- Install the required dependencies using the requirements file
- Run the flask server by running the following command:

```
flask run
```

- To create a public server(over the same wifi network), run the following command:

```
flask run --host=0.0.0.0
```

## FAQs

#### Allowing Port:

[Open a static port in the Windows firewall for TCP access](https://www.firehousesoftware.com/webhelp/FH/Content/FHEnterprise/FHEnterpriseInstallationGuide/24_StaticPort.htm)

#### Running flask:

[Configure Flask dev server to be visible across the network](https://stackoverflow.com/questions/7023052/configure-flask-dev-server-to-be-visible-across-the-network)

**Note:** MUST BE ON SAME NETWORK!
