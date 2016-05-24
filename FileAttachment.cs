public class FileAttachment
    {
        public string content { get; set; }
        public string datatype { get; set; }
        public string icon { get; set; }
        public string id { get; set; }
        public long lastModified { get; set; }
        public DateTime lastModifiedDate { get; set; }
        public string name { get; set; }

        /// <summary>
        /// below are the changed flags for operation and version
        /// </summary>
        public bool AddFile { get; set; }
        public bool UpdateFile { get; set; }
        public bool DeleteFile { get; set; }
        public bool NewFile { get; set; }
        public bool DBFile { get; set; }

        public long size { get; set; }
        public string type { get; set; }
        public string url { get; set; }
        public string webkitRelativePath { get; set; }
        public string serverRelativeUrl { get; set; }


        public IDictionary<string, object> MetaData { get; set; }

        public FileAttachment()
        {
            MetaData = new Dictionary<string, object>();
        }
    }