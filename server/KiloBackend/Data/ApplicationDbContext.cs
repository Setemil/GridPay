using Kilo.Models;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<EnergyLog> EnergyLogs { get; set; }
        public DbSet<Meter> Meters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasKey(u => u.ExternalId);

            modelBuilder.Entity<Meter>()
                .HasIndex(m => m.DeviceId)
                .IsUnique();

            //Relationships
            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Seller)
                .WithMany(u => u.Listings)
                .HasForeignKey(l => l.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Meter)
                .WithOne()
                .HasForeignKey<Listing>(l => l.MeterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Buyer)
                .WithMany(u => u.BuyerTransactions)
                .HasForeignKey(t => t.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Seller)
                .WithMany(u => u.SellerTransactions)
                .HasForeignKey(t => t.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnergyLog>()
                .HasOne(e => e.Transaction)
                .WithMany(t => t.EnergyLogs)
                .HasForeignKey(e => e.TransactionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Meter>()
                .HasOne(m => m.Seller)
                .WithMany()
                .HasForeignKey(m => m.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            //Performance
            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.Status);

            modelBuilder.Entity<Listing>()
                .HasIndex(l => l.SellerId);

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.PaymentReference);

            //decimals
            modelBuilder.Entity<Transaction>()
                .Property(t => t.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Transaction>()
                .Property(t => t.PlatformFee)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Transaction>()
                .Property(t => t.PricePerKwhSnapshot)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Transaction>()
                .Property(t => t.RequestedKwh)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<Transaction>()
                .Property(t => t.DeliveredKwh)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<Listing>()
                .Property(l => l.PricePerKwh)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<EnergyLog>()
                .Property(e => e.DeliveredKwh)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<Meter>()
                .Property(m => m.TotalGeneratedKwh)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<Meter>()
                .Property(m => m.ConsumedKwh)
                .HasColumnType("decimal(18,4)");

            //Concurrency Control
            modelBuilder.Entity<Listing>()
                .Property<byte[]>("RowVersion")
                .IsRowVersion();

            //Timestamps
            modelBuilder.Entity<Transaction>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<EnergyLog>()
                .Property(e => e.Timestamp)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Meter>()
                .Property(m => m.LastUpdated)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}