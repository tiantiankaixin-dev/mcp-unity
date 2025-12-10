using System;

namespace McpUnity.Tools
{
    /// <summary>
    /// Attribute to mark a class as an MCP Tool.
    /// This is used by the tool generator and can be used for reflection-based discovery.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public class McpToolAttribute : Attribute
    {
        public string Name { get; }
        public string Description { get; }

        public McpToolAttribute(string name, string description)
        {
            Name = name;
            Description = description;
        }
    }
}
