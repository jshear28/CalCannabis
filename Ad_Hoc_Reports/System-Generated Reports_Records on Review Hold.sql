-- Detail
SELECT TOP 100  
[DBO].[V_CONDITION_RECORD].[RECORD_ID] AS 'RECORD ID', [DBO].[V_CONDITION_RECORD].[CONDITION_NAME] AS 'CONDITION NAME', [DBO].[V_CONDITION_RECORD].[COMMENTS_LONG] AS 'REASON', [DBO].[V_CONDITION_RECORD].[ACTION_BY_NAME_FML#] AS 'CONDITION ADDED BY', [DBO].[V_CONDITION_RECORD].[STATUS] AS 'CONDITION STATUS'
FROM [DBO].[V_RECORD] WITH(NOLOCK) 
INNER JOIN [DBO].[V_CONDITION_RECORD] WITH(NOLOCK)  ON [DBO].[V_CONDITION_RECORD].[RECORD_ID]=[DBO].[V_RECORD].[RECORD_ID]
WHERE ( ([DBO].[V_CONDITION_RECORD].[CONDITION_NAME] = 'Review Hold') AND ([DBO].[V_CONDITION_RECORD].[STATUS] = 'Applied') ) AND (([DBO].[V_RECORD].[AGENCY_ID] = 'CALCANNABIS')) AND (([DBO].[V_CONDITION_RECORD].[AGENCY_ID] = 'CALCANNABIS'));

-- CSS (none)