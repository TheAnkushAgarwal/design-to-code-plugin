figma.showUI(__html__, { themeColors: true, height: 500, width: 500 });

function extractPropertiesFromNodes(nodes: any[]) {
  const properties = nodes.map(node => ({
    dimensions: { width: node.width, height: node.height, x: node.x, y: node.y },
    backgroundColor: node.fills ? (node.fills[0] && node.fills[0].color ? 
      {r: node.fills[0].color.r, g: node.fills[0].color.g, b: node.fills[0].color.b} 
      : null) : null,
    inferredLayout: node.inferredAutoLayout,
    opacity : node.opacity
  }));
  return properties;
}



const nodes = figma.currentPage.findAll(node => node.type === 'RECTANGLE' || node.type === 'FRAME');

// console.log("nodes are: ", nodes);

const properties = extractPropertiesFromNodes(nodes);

// console.log(properties);



figma.loadAllPagesAsync() 

let count = 0
let divs = "";

function traverse(node: any) {

  if ("children" in node) {
    if (node.type !== "INSTANCE") {
      for (const child of node.children) {
        if(child.type==="FRAME" ){
          console.log(child.type);
          divs += `<div class="frame-div-${count}"> \n`;
          count++;

        }

        if(child.type==="RECTANGLE" ){
          console.log(child.type);
          divs += `<div class="rectangle-div-${count} "> \n`;
          count++;

        }
          
        traverse(child)

        divs +="</div>\n"
      }
    }
  }

}



traverse(figma.root)





function generateCode(properties: any[]) {
  let cssCode =`
  .main-div{
    position: relative;
    overflow: hidden;
    margin: auto auto;
    padding: 0px;
    box-sizing: border-box;
  }`;
  let htmlCode="";



  console.log("div length is: ", divs.length);



  for(var val in properties){
    // console.log(properties[val]);

    if(properties[val].inferredLayout !== undefined)
    {
      console.log("inferred layout found");
      const {counterAxisAlignItems, counterAxisSizingMode, itemSpacing, layoutAlign, layoutGrow, layoutMode, layoutPositioning, paddingBottom, paddingLeft, paddingRight, paddingTop, primaryAxisAlignItems, primaryAxisSizingMode, layoutWrap} = properties[val].inferredLayout;

      let widPix = properties[val].dimensions.width;
      let heightPix = properties[val].dimensions.height;

      if(paddingTop !== null || paddingBottom !== null){
        heightPix -= paddingTop;
        heightPix -= paddingBottom;
      }

      if(paddingLeft !== null || paddingRight !== null){
        widPix -= paddingLeft;
        widPix -= paddingRight;
      }

      const flexDirection = layoutMode === 'HORIZONTAL' ? 'row' : 'column';
      const wrap = layoutWrap === 'WRAP' ? 'wrap': 'nowrap'

      let justifyContent = '';
      switch (primaryAxisAlignItems) {
        case 'MIN':
          justifyContent = 'flex-start';
          break;
        case 'CENTER':
          justifyContent = 'center';
          break;
        case 'MAX':
          justifyContent = 'flex-end';
          break;
        case 'SPACE_BETWEEN':
          justifyContent = 'space-between';
          break;
        default:
          justifyContent = 'flex-start';
      }

      let alignItems = '';
      switch (counterAxisAlignItems) {
        case 'MIN':
          alignItems = 'flex-start';
          break;
        case 'MAX':
          alignItems = 'flex-end';
          break;
        case 'CENTER':
          alignItems = 'center';
          break;
        case 'BASELINE':
          alignItems = 'baseline';
          break;
        default:
          alignItems = 'stretch';
      }

      const alignContent = counterAxisAlignItems === 'MIN' ? 'flex-start' : 'center';

      cssCode += `
      .frame-div-${val} {
        display: flex;
        flex-direction: ${flexDirection};
        flex-grow: ${layoutGrow};
        justify-content: ${justifyContent};
        align-items: ${alignItems};
        align-content: ${alignContent};
        flex-wrap: ${wrap};
        ${primaryAxisAlignItems !== 'SPACE_BETWEEN' ? `gap: ${itemSpacing}px;`: ""};
        padding-top: ${paddingTop}px;
        padding-bottom: ${paddingBottom}px;
        padding-left: ${paddingLeft}px;
        padding-right: ${paddingRight}px;
        margin: 0;


        width: ${widPix}px;
        height: ${heightPix}px;
        opacity : ${properties[val].opacity};
        ${properties[val].backgroundColor !== null ?`background: rgb(${Math.round(properties[val].backgroundColor.r * 255)}, ${Math.round(properties[val].backgroundColor.g * 255)}, ${Math.round(properties[val].backgroundColor.b * 255)});`:"" }
      }`

      
    }

    else{
      console.log("No inferred auto layout found");


      cssCode += `      
        .rectangle-div-${val} {
          width: ${properties[val].dimensions.width}px;
          height: ${properties[val].dimensions.height}px;
          opacity : ${properties[val].opacity};
          overflow: visible;
          ${properties[val].backgroundColor !== null ?`background: rgb(${Math.round(properties[val].backgroundColor.r * 255)}, ${Math.round(properties[val].backgroundColor.g * 255)}, ${Math.round(properties[val].backgroundColor.b * 255)});`:"" }
        }`

    }

  }


  htmlCode = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Design to Code Plugin by Ankush Agarwal</title>
      <link rel ="stylesheet" href="styles.css">
    </head>
    <body>
      <div class="main-div">
      ${divs}
      </div>
    </body>
    </html>
  `;


  return {htmlCode, cssCode};

  
}


const { htmlCode, cssCode } = generateCode(properties);

figma.ui.postMessage({ type: 'generatedCode', htmlCode, cssCode });

