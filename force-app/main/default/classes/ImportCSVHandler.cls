public with sharing class ImportCSVHandler {    

    @AuraEnabled
    public static List<Account> ReadCSVFile(String base64Data) {
        String data=JSON.deserializeUntyped(base64Data).toString();
        List<Account> lstAcc = new List<Account>();
        List<String> lstCSVLines = data.split('\n');
        for(Integer i = 1; i < lstCSVLines.size(); i++){           
            String csvLine = lstCSVLines[i];
            String prevLine = csvLine;
            Integer startIndex;
            Integer endIndex;
            
            while(csvLine.indexOf('"') > -1){            
                if(startIndex == null){
                    startIndex = csvLine.indexOf('"');
                    csvLine = csvLine.substring(0, startIndex) + ':quotes:' + csvLine.substring(startIndex+1, csvLine.length());
                }else{
                    if(endIndex == null){
                        endIndex = csvLine.indexOf('"');
                        csvLine = csvLine.substring(0, endIndex) + ':quotes:' + csvLine.substring(endIndex+1, csvLine.length());
                    }
                }
                
                if(startIndex != null && endIndex != null){
                    String sub = csvLine.substring(startIndex, endIndex);
                    sub = sub.replaceAll(',', ':comma:');
                    csvLine = csvLine.substring(0, startIndex) + sub + csvLine.substring(endIndex, csvLine.length());
                    startIndex = null;
                    endIndex = null;
                }
            }
            
            List<String> csvRowData = new List<String>();
            for(String column : csvLine.split(',')){
                column = column.replaceAll(':quotes:', '').replaceAll(':comma:', ',');
                csvRowData.add(column);
            }         
            
            lstAcc.add(new Account(
                Name = csvRowData[0],
                Rating=csvRowData[1],
                Type=csvRowData[2],
                Industry=csvRowData[3]                
            ));
        }       
        return lstAcc;       
    }

    @AuraEnabled
    public static string SaveFile(string jsonString){
        string sMessage='';
        try {
            List<Account> lstACCToInsert=(List<Account>)JSON.deserialize(jsonString, List<Account>.class);
            insert lstACCToInsert;
            sMessage='SUCCESS';
        } catch (Exception e) {
            sMessage=e.getMessage();
        }
        return sMessage;
    }
}