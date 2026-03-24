namespace Kilo.Response
{
    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public Object? Data { get; set; }
    }
}
