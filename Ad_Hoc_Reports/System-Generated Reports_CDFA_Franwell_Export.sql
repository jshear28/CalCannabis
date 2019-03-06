-- Detail
SELECT TOP 100  
[DBO].[V_RECORD].[RECORD_ID] AS 'RECORD ID', [DBO].[V_CONTACT].[NAME_FIRST] AS 'FIRST NAME', null AS 'MIDDLE NAME', [DBO].[V_CONTACT].[NAME_LAST] AS 'NAME LAST', [DBO].[V_CONTACT].[EMAIL] AS 'EMAIL', [DBO].[V_CONTACT].[PHONE3] AS 'PHONE', [DBO].[V_RECORD].[DESCRIPTION] AS 'LEGAL BUSINESS NAME'
FROM [DBO].[V_RECORD] WITH(NOLOCK) 
INNER JOIN [DBO].[V_CONTACT] WITH(NOLOCK)  ON [DBO].[V_CONTACT].[RECORD_ID]=[DBO].[V_RECORD].[RECORD_ID]
WHERE (([DBO].[V_RECORD].[DATE_OPENED] BETWEEN '2017-12-22T00:00:00.000' AND '2017-12-22T23:59:59.000') AND ([DBO].[V_CONTACT].[CONTACT_TYPE] = 'Designated Responsible Party') AND ([DBO].[V_RECORD].[RECORD_TYPE_TYPE] = 'Cultivator') AND ([DBO].[V_RECORD].[RECORD_TYPE_CATEGORY] = 'Application')) AND (([DBO].[V_RECORD].[AGENCY_ID] = 'CALCANNABIS')) AND (([DBO].[V_CONTACT].[AGENCY_ID] = 'CALCANNABIS'));

-- CSS (none)