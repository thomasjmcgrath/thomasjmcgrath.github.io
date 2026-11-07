export function standaloneGate(req:Request,config:{standalone?:string;maintenanceToken?:string}):Response|null{
 if(config.standalone!=='1')return null;
 const path=new URL(req.url).pathname.replace(/\/+$/,'')||'/';
 if(['/admin','/api/admin','/mcp','/signin-with-chatgpt','/signout-with-chatgpt','/callback'].some(p=>path===p||path.startsWith(p+'/')))return Response.json({error:'These owner tools are available only on the private Sites deployment.'},{status:403});
 if(path==='/api/maintenance'&&(!config.maintenanceToken||req.headers.get('Authorization')!=='Bearer '+config.maintenanceToken))return Response.json({error:'Maintenance authorization is required.'},{status:403});
 return null;
}
